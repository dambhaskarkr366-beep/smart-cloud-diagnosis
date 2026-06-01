// cloudfunctions/toggleFavorite/index.js
// 切换收藏状态：已收藏 → 取消；未收藏 → 收藏
// 同时更新 items 集合的 favorCount
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { itemId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!itemId) {
    return { code: -1, data: null, message: "缺少 itemId 参数" };
  }
  if (!openid) {
    return { code: -1, data: null, message: "未获取到用户 openid" };
  }

  try {
    // 1. 查询是否已收藏
    const favRes = await db
      .collection("favorites")
      .where({
        itemId,
        _openid: openid,
      })
      .get();

    const isFavorited = favRes.data.length > 0;

    if (isFavorited) {
      // 2a. 取消收藏：删除 favorites 记录，favorCount -1（不小于0）
      await db
        .collection("favorites")
        .doc(favRes.data[0]._id)
        .remove();

      await db
        .collection("items")
        .doc(itemId)
        .update({
          data: {
            favorCount: _.inc(-1),
          },
        });

      return {
        code: 0,
        data: { isFavorited: false },
        message: "已取消收藏",
      };
    } else {
      // 2b. 收藏：写入 favorites，favorCount +1
      await db.collection("favorites").add({
        data: {
          itemId,
          _openid: openid,
          createdAt: db.serverDate(),
        },
      });

      await db
        .collection("items")
        .doc(itemId)
        .update({
          data: {
            favorCount: _.inc(1),
          },
        });

      // 记录收藏行为
      const itemRes = await db.collection("items").doc(itemId).field({ category: true }).get();
      db.collection("userBehaviors").add({
        data: {
          userId: openid,
          itemId,
          type: "favorite",
          category: itemRes.data?.category || "",
          createdAt: db.serverDate(),
        },
      }).catch(() => {});

      return {
        code: 0,
        data: { isFavorited: true },
        message: "已收藏",
      };
    }
  } catch (err) {
    console.error("toggleFavorite 失败：", err);
    return {
      code: -1,
      data: null,
      message: "操作失败：" + err.message,
    };
  }
};
