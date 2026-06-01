// cloudfunctions/getRecommendList/index.js
// 推荐算法：内容匹配 + 热度 + 时效 + User-CF + Item-CF + 场景加权
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// ==================== 权重 ====================
const W_CONTENT    = 0.20; // 内容匹配
const W_POPULARITY = 0.10; // 热度
const W_FRESHNESS  = 0.10; // 时效
const W_USER_CF    = 0.30; // 用户协同过滤
const W_ITEM_CF    = 0.20; // 物品协同过滤
const W_CONTEXT    = 0.10; // 场景加权（毕业季/地域）

const MAX_VIEW = 1000, MAX_FAVOR = 200, MAX_CONTACT = 100;

// ==================== 内容匹配 ====================
function computeContentScore(item, history, keyword) {
  const keywords = [];
  if (keyword && keyword.trim()) keywords.push({ w: keyword.trim().toLowerCase(), weight: 3 });
  if (history && Array.isArray(history)) {
    history.slice(0, 10).forEach((kw, i) => {
      if (kw && kw.trim()) keywords.push({ w: kw.trim().toLowerCase(), weight: 1 + (10 - i) * 0.1 });
    });
  }
  if (keywords.length === 0) return 30;

  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();
  const cat = (item.category || "").toLowerCase();
  let score = 0, totalW = 0;

  for (const { w, weight } of keywords) {
    if (!w) continue; totalW += weight;
    if (title.includes(w)) score += weight * 10;
    const tws = title.split(/[\s,，、。！？]+/).filter(Boolean);
    for (const tw of tws) { if (tw.includes(w) || w.includes(tw)) { score += weight * 4; break; } }
    if (desc.includes(w)) score += weight * 2;
    if (cat === w || cat.includes(w)) score += weight * 5;
  }
  return totalW > 0 ? Math.min(100, (score / (totalW * 10)) * 100) : 30;
}

// ==================== 热度 ====================
function computePopularityScore(item) {
  const v = Math.min(item.viewCount || 0, MAX_VIEW);
  const f = Math.min(item.favorCount || 0, MAX_FAVOR);
  const c = Math.min(item.contactCount || 0, MAX_CONTACT);
  return Math.min(100, (v / MAX_VIEW) * 30 + (f / MAX_FAVOR) * 40 + (c / MAX_CONTACT) * 30);
}

// ==================== 时效 ====================
function computeFreshnessScore(item) {
  if (!item.createdAt) return 50;
  const h = (Date.now() - new Date(item.createdAt).getTime()) / 3600000;
  if (h < 1) return 100; if (h < 24) return 90; if (h < 72) return 75;
  if (h < 168) return 60; if (h < 720) return 40; return 20;
}

// ==================== 场景加权 ====================
function computeContextScore(item, openid) {
  let score = 50;
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // 毕业季（5-7月）：教材、生活用品、数码加权
  if (month >= 5 && month <= 7) {
    const gradCats = ["教材书籍", "生活用品", "数码", "运动"];
    if (gradCats.includes(item.category)) score += 30;
  }

  // 开学季（2-3月、9月）：教材书籍加权
  if (month === 2 || month === 3 || month === 9) {
    if (item.category === "教材书籍") score += 30;
  }

  // 新品加权（24小时内）
  if (item.createdAt) {
    const h = (Date.now() - new Date(item.createdAt).getTime()) / 3600000;
    if (h < 24) score += 15;
  }

  return Math.min(100, score);
}

// ==================== 主入口 ====================
exports.main = async (event, context) => {
  const { category, keyword, searchHistory, page = 1, pageSize = 20 } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // === 1. 获取用户行为数据 ===
  let userItemIds = [], favoritedItemIds = [];
  if (openid) {
    try {
      const behaviors = await db.collection("userBehaviors")
        .where({ userId: openid })
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
      const all = behaviors.data || [];
      userItemIds = [...new Set(all.map(b => b.itemId))];
      favoritedItemIds = [...new Set(all.filter(b => b.type === "favorite").map(b => b.itemId))];
    } catch (e) { /* ignore */ }
  }

  // === 2. 搜索历史 ===
  let history = searchHistory || [];
  if ((!history || history.length === 0) && openid) {
    try {
      const ur = await db.collection("users").where({ _openid: openid }).field({ searchHistory: true }).get();
      if (ur.data?.[0]?.searchHistory) history = ur.data[0].searchHistory;
    } catch (e) { /* ignore */ }
  }
  if (keyword && keyword.trim()) history = [keyword.trim(), ...history].slice(0, 10);

  // === 3. 查询候选商品 ===
  const where = { status: "selling" };
  if (category && category !== "全部") where.category = category;
  if (keyword && keyword.trim()) {
    where.title = db.RegExp({ regexp: keyword.trim(), options: "i" });
  }

  try {
    const candidates = await db.collection("items").where(where)
      .orderBy("createdAt", "desc").limit(250).get();
    const items = candidates.data || [];

    // === 4. 批量预计算 CF 分数（避免逐条查询） ===
    const candidateIds = items.map(i => i._id);

    // User-CF: 批量查相似用户对这些候选商品的交互次数
    const userCFMap = {};
    if (openid && userItemIds.length > 0) {
      try {
        const suRes = await db.collection("userBehaviors")
          .where({ itemId: _.in(userItemIds.slice(0, 20)), userId: _.neq(openid) })
          .field({ userId: true }).limit(100).get();
        const simUserIds = [...new Set((suRes.data || []).map(b => b.userId))];
        if (simUserIds.length > 0) {
          const intRes = await db.collection("userBehaviors")
            .where({ itemId: _.in(candidateIds), userId: _.in(simUserIds.slice(0, 30)) })
            .get();
          (intRes.data || []).forEach(r => {
            userCFMap[r.itemId] = (userCFMap[r.itemId] || 0) + 1;
          });
        }
      } catch (e) { /* ignore */ }
    }

    // Item-CF: 批量获取收藏商品的类别 + 协同收藏次数
    const itemCFMap = {};
    const favCats = [];
    if (openid && favoritedItemIds.length > 0) {
      try {
        const favItems = await db.collection("items")
          .where({ _id: _.in(favoritedItemIds.slice(0, 10)) })
          .field({ category: true, price: true }).get();
        (favItems.data || []).forEach(fi => { if (fi.category) favCats.push({ cat: fi.category, price: fi.price }); });

        // 协同收藏
        const coFav = await db.collection("userBehaviors")
          .where({ itemId: _.in(favoritedItemIds.slice(0, 5)), type: "favorite" })
          .field({ userId: true }).limit(100).get();
        const coUserIds = [...new Set((coFav.data || []).map(b => b.userId))];
        if (coUserIds.length > 0) {
          const targetFav = await db.collection("userBehaviors")
            .where({ itemId: _.in(candidateIds), type: "favorite", userId: _.in(coUserIds.slice(0, 30)) })
            .get();
          (targetFav.data || []).forEach(r => {
            itemCFMap[r.itemId] = (itemCFMap[r.itemId] || 0) + 1;
          });
        }
      } catch (e) { /* ignore */ }
    }

    // === 5. 综合打分 ===
    const scored = [];
    for (const item of items) {
      const contentScore   = computeContentScore(item, history, keyword);
      const popularityScore = computePopularityScore(item);
      const freshnessScore  = computeFreshnessScore(item);
      const contextScore    = computeContextScore(item, openid);

      // User-CF 分
      const uc = userCFMap[item._id] || 0;
      const userCFScore = Math.min(100, 30 + uc * 15);

      // Item-CF 分
      let icBase = 30;
      if (favCats.some(fc => fc.cat === item.category)) icBase += 30;
      const icCo = itemCFMap[item._id] || 0;
      const itemCFScore = Math.min(100, icBase + icCo * 8);

      const total = contentScore * W_CONTENT
                  + popularityScore * W_POPULARITY
                  + freshnessScore * W_FRESHNESS
                  + userCFScore * W_USER_CF
                  + itemCFScore * W_ITEM_CF
                  + contextScore * W_CONTEXT;

      scored.push({ ...item, _score: Math.round(total * 100) / 100 });
    }

    scored.sort((a, b) => b._score - a._score);

    const start = (page - 1) * pageSize;
    const list = scored.slice(start, start + pageSize);

    return { code: 0, data: { list, total: scored.length, page, pageSize, hasMore: start + pageSize < scored.length }, message: "success" };
  } catch (err) {
    console.error("getRecommendList error:", err);
    return { code: -1, data: null, message: err.message };
  }
};
