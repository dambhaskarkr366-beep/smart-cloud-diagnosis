// cloudfunctions/publishItem/index.js
// 发布商品：校验参数 → 读取卖家信息 → 写入 items 集合
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

  const {
    title,
    originalPrice,
    price,
    category,
    condition,
    location,
    description,
    tradeMethod,
    images,
  } = event;

  // ===== 参数校验 =====
  if (!title || !title.trim()) {
    return { code: -1, data: null, message: "请输入商品标题" };
  }
  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return { code: -1, data: null, message: "请输入有效的价格" };
  }
  if (!category) {
    return { code: -1, data: null, message: "请选择分类" };
  }
  if (!condition) {
    return { code: -1, data: null, message: "请选择新旧程度" };
  }
  if (!location || !location.trim()) {
    return { code: -1, data: null, message: "请输入交易地点" };
  }
  if (!tradeMethod) {
    return { code: -1, data: null, message: "请选择交易方式" };
  }
  if (!images || images.length === 0) {
    return { code: -1, data: null, message: "请至少上传一张商品图片" };
  }

  try {
    // ===== 读取卖家信息 =====
    let sellerName = "匿名用户";
    let sellerAvatar = "";
    let sellerCampus = "";
    let sellerDormitory = "";

    try {
      const userRes = await db
        .collection("users")
        .where({ _openid: openid })
        .get();

      if (userRes.data && userRes.data.length > 0) {
        const user = userRes.data[0];
        sellerName = user.nickName || sellerName;
        sellerAvatar = user.avatarUrl || sellerAvatar;
        sellerCampus = user.campus || sellerCampus;
        sellerDormitory = user.dormitory || sellerDormitory;
      }
    } catch (userErr) {
      console.warn("读取卖家信息失败，使用默认值：", userErr);
    }

    // ===== 写入 items 集合 =====
    const itemData = {
      _openid: openid,
      title: title.trim(),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      price: Number(price),
      category,
      condition,
      location: location.trim(),
      description: (description || "").trim(),
      tradeMethod,
      images,
      // 卖家信息
      sellerId: openid,
      sellerName,
      sellerAvatar,
      sellerCampus,
      sellerDormitory,
      // 统计初始值
      viewCount: 0,
      favorCount: 0,
      contactCount: 0,
      // 状态
      status: "selling",
      // 时间
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const addRes = await db.collection("items").add({
      data: itemData,
    });

    return {
      code: 0,
      data: {
        itemId: addRes._id,
      },
      message: "发布成功",
    };
  } catch (err) {
    console.error("publishItem 失败：", err);
    return {
      code: -1,
      data: null,
      message: "发布失败：" + err.message,
    };
  }
};
