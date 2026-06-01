// cloudfunctions/getMessages/index.js
// 获取会话消息列表（按时间升序，支持分页）
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { conversationId, to, itemId, pageSize = 50, lastCreatedAt } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { code: -1, data: null, message: "未获取到用户身份" };
  }

  // 确定会话 ID
  let convId = conversationId;
  if (!convId && to && itemId) {
    convId = [openid, to].sort().join("_") + "_" + itemId;
  }

  if (!convId) {
    return { code: -1, data: null, message: "缺少会话标识" };
  }

  try {
    // 构建查询条件
    const where = { conversationId: convId };

    // 若传了 lastCreatedAt，只拉取此时间之后的消息（增量轮询）
    if (lastCreatedAt) {
      where.createdAt = _.gt(new Date(lastCreatedAt));
    }

    const res = await db
      .collection("messages")
      .where(where)
      .orderBy("createdAt", "asc")
      .limit(pageSize)
      .get();

    // 标记每条消息是"我发的"还是"对方发的"
    const messages = res.data.map((msg) => ({
      ...msg,
      isMine: msg.from === openid,
    }));

    // 将对方发给我的未读消息全部标为已读
    const unreadIds = res.data
      .filter(msg => msg.to === openid && !msg.read)
      .map(msg => msg._id);
    if (unreadIds.length > 0) {
      db.collection("messages")
        .where({ _id: _.in(unreadIds) })
        .update({ data: { read: true } })
        .catch(() => {});
    }

    return {
      code: 0,
      data: {
        messages,
        conversationId: convId,
      },
      message: "success",
    };
  } catch (err) {
    console.error("getMessages 失败：", err);
    return {
      code: -1,
      data: null,
      message: "获取消息失败：" + err.message,
    };
  }
};
