// cloudfunctions/getOpenid/index.js
// 云函数：获取当前用户的 openid
// 支持两种模式：
//   1. 无参调用 → 直接从 wxContext 获取（云开发自动注入的调用者信息）
//   2. 传入 code → 通过 code 换取 openid（配合前端 wx.login 使用）
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  // 优先从 wxContext 获取（云开发已自动完成 code → openid 的转换）
  let openid = wxContext.OPENID;

  // 若 wxContext 未提供 openid 且前端传了 code，手动换取
  if (!openid && event.code) {
    try {
      const res = await cloud.openapi.auth.code2Session({
        code: event.code,
      });
      openid = res.openid;
    } catch (err) {
      console.error("code2Session 失败：", err);
      return {
        code: -1,
        data: null,
        message: "获取 openid 失败：" + err.message,
      };
    }
  }

  if (!openid) {
    return {
      code: -1,
      data: null,
      message: "未能获取 openid，请检查云环境配置",
    };
  }

  return {
    code: 0,
    data: {
      openid,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    },
    message: "success",
  };
};
