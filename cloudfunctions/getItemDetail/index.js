// cloudfunctions/getItemDetail/index.js
// 获取商品详情，同时浏览量 +1
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { itemId } = event;

  if (!itemId) {
    return { code: -1, data: null, message: "缺少 itemId 参数" };
  }

  try {
    // 1. 查询商品
    const itemRes = await db
      .collection("items")
      .doc(itemId)
      .get();

    if (!itemRes.data) {
      return { code: -1, data: null, message: "商品不存在或已下架" };
    }

    const item = itemRes.data;

    // 2. 浏览量 +1（原子操作，不会覆盖其他字段的并发更新）
    await db
      .collection("items")
      .doc(itemId)
      .update({
        data: {
          viewCount: _.inc(1),
        },
      });

    // 3. 记录浏览行为（异步，不阻塞返回）
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    if (openid) {
      db.collection("userBehaviors").add({
        data: {
          userId: openid,
          itemId,
          type: "view",
          category: item.category || "",
          createdAt: db.serverDate(),
        },
      }).catch(() => {}); // 静默失败，不影响主流程
    }

    // 4. 返回商品数据
    item.viewCount = (item.viewCount || 0) + 1;

    return {
      code: 0,
      data: { item },
      message: "success",
    };
  } catch (err) {
    console.error("getItemDetail 失败：", err);
    return {
      code: -1,
      data: null,
      message: "查询失败：" + err.message,
    };
  }
};
