// cloudfunctions/getConversations/index.js
// 获取当前用户的所有会话列表（买卖双方通用）
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return { code: -1, data: null, message: "未登录" };

  try {
    // 1. 查出我参与的所有消息（from 或 to 是我），按时间倒序
    const msgRes = await db.collection("messages")
      .where(_.or([{ from: openid }, { to: openid }]))
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    const messages = msgRes.data || [];
    if (messages.length === 0) {
      return { code: 0, data: { conversations: [] }, message: "success" };
    }

    // 2. 按 conversationId 分组，取每组最新一条
    const convMap = {};
    const itemIds = new Set();
    const userIds = new Set();

    for (const msg of messages) {
      if (!convMap[msg.conversationId]) {
        convMap[msg.conversationId] = {
          conversationId: msg.conversationId,
          itemId: msg.itemId,
          otherUserId: msg.from === openid ? msg.to : msg.from,
          lastMsg: msg.content,
          lastMsgType: msg.type || "text",
          lastTime: msg.createdAt,
          unreadCount: 0,
        };
        itemIds.add(msg.itemId);
        userIds.add(msg.from === openid ? msg.to : msg.from);
      }
      // 统计未读数（对方发给我的 + 未标记已读）
      if (msg.from !== openid && !msg.read && convMap[msg.conversationId]) {
        convMap[msg.conversationId].unreadCount++;
      }
    }

    const conversations = Object.values(convMap);

    // 3. 批量查用户信息
    const userMap = {};
    if (userIds.size > 0) {
      const users = await db.collection("users")
        .where({ _openid: _.in([...userIds]) })
        .field({ _openid: true, nickName: true, avatarUrl: true })
        .get();
      (users.data || []).forEach(u => { userMap[u._openid] = u; });
    }

    // 4. 批量查商品信息
    const itemMap = {};
    if (itemIds.size > 0) {
      const items = await db.collection("items")
        .where({ _id: _.in([...itemIds]) })
        .field({ title: true, price: true, images: true, status: true })
        .get();
      (items.data || []).forEach(i => { itemMap[i._id] = i; });
    }

    // 5. 拼装结果
    const result = conversations.map(c => {
      const user = userMap[c.otherUserId] || {};
      const item = itemMap[c.itemId] || {};
      return {
        ...c,
        otherUserName: user.nickName || "用户",
        otherUserAvatar: user.avatarUrl || "",
        itemTitle: item.title || "商品",
        itemPrice: item.price || 0,
        itemImage: (item.images && item.images[0]) || "",
        itemStatus: item.status || "selling",
      };
    });

    // 按最新消息时间倒序
    result.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

    return { code: 0, data: { conversations: result }, message: "success" };
  } catch (err) {
    console.error("getConversations error:", err);
    return { code: -1, data: null, message: err.message };
  }
};
