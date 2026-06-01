// cloudfunctions/sendMessage/index.js
// 发送消息：写入 messages 集合
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { code: -1, data: null, message: "未获取到用户身份" };
  }

  const { to, itemId, content, type = "text", conversationId } = event;

  // ===== 参数校验 =====
  if (!to) {
    return { code: -1, data: null, message: "缺少接收者" };
  }
  if (!itemId) {
    return { code: -1, data: null, message: "缺少关联商品" };
  }
  const finalContent = type === "image" ? content : (content || "").trim();
  if (!finalContent) {
    return { code: -1, data: null, message: "消息不能为空" };
  }

  // 生成会话 ID（两个 openid 排序后拼接，保证同一对用户只有一种排序）
  const convId =
    conversationId ||
    [openid, to].sort().join("_") + "_" + itemId;

  try {
    const addRes = await db.collection("messages").add({
      data: {
        conversationId: convId,
        itemId,
        from: openid,
        to,
        content: finalContent,
        type: type || "text",
        read: false,
        createdAt: db.serverDate(),
      },
    });

    return {
      code: 0,
      data: {
        messageId: addRes._id,
        conversationId: convId,
      },
      message: "发送成功",
    };
  } catch (err) {
    console.error("sendMessage 失败：", err);
    return {
      code: -1,
      data: null,
      message: "发送失败：" + err.message,
    };
  }
};
