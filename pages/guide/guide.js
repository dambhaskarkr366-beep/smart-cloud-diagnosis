// pages/guide/guide.js —— 新用户引导页（中南大专版）
//   Step 0: 欢迎页
//   Step 1: 一键选头像/昵称 + 校区 + 宿舍区域 → 写入 users
const app = getApp();

Page({
  data: {
    step: 0,
    // 头像临时路径
    avatarTempUrl: "",
    // 昵称（微信一键获取）
    nickName: "",
    // 校区
    campus: "",
    campusIndex: -1,
    campuses: ["南湖校区", "首义校区"],
    // 宿舍区域
    dormitory: "",
    dormitoryIndex: -1,
    dormitories: ["环湖", "望湖", "滨湖", "临湖", "中区"],
    // 状态
    openidReady: false,
    loading: true,
    submitting: false,
  },

  async onLoad() {
    await app.globalData.loginReadyPromise;
    if (app.globalData.openid) {
      this.setData({ openidReady: true });
    } else {
      wx.showModal({
        title: "网络异常",
        content: "获取登录信息失败，请检查网络后重试",
        showCancel: false,
        confirmText: "重试",
        success: async (res) => {
          if (res.confirm) {
            await app.wxLoginAndFetchOpenid();
            if (app.globalData.openid) this.setData({ openidReady: true });
          }
        },
      });
    }
    this.setData({ loading: false });
  },

  onStart() {
    this.setData({ step: 1 });
  },

  // 微信一键获取头像
  onChooseAvatar(e) {
    this.setData({ avatarTempUrl: e.detail.avatarUrl });
  },

  // 微信一键获取昵称
  onNickNameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  // 校区选择
  onCampusChange(e) {
    const idx = e.detail.value;
    this.setData({ campusIndex: idx, campus: this.data.campuses[idx] });
  },

  // 宿舍选择
  onDormitoryChange(e) {
    const idx = e.detail.value;
    this.setData({ dormitoryIndex: idx, dormitory: this.data.dormitories[idx] });
  },

  // 提交
  async onSubmit() {
    const { campus, dormitory, avatarTempUrl, nickName } = this.data;

    if (!nickName) { wx.showToast({ title: "请输入昵称", icon: "none" }); return; }
    if (!campus) { wx.showToast({ title: "请选择校区", icon: "none" }); return; }
    if (!dormitory) { wx.showToast({ title: "请选择宿舍区域", icon: "none" }); return; }

    this.setData({ submitting: true });
    wx.showLoading({ title: "注册中…", mask: true });

    try {
      const db = wx.cloud.database();
      const openid = app.globalData.openid;

      // 上传头像
      let avatarUrl = "";
      if (avatarTempUrl) {
        try {
          const up = await wx.cloud.uploadFile({
            cloudPath: `avatars/${openid}_${Date.now()}.png`,
            filePath: avatarTempUrl,
          });
          avatarUrl = up.fileID;
        } catch (e) { /* 忽略 */ }
      }

      // 写入 users
      const addRes = await db.collection("users").add({
        data: {
          nickName,
          avatarUrl,
          campus,
          dormitory,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });

      const userInfo = {
        _id: addRes._id,
        _openid: openid,
        nickName,
        avatarUrl,
        campus,
        dormitory,
      };

      app.setUserInfo(userInfo);
      wx.hideLoading();
      wx.showToast({ title: "欢迎加入！", icon: "success" });
      setTimeout(() => wx.switchTab({ url: "/pages/index/index" }), 800);
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: "注册失败，请重试", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onAvatarError() { /* src 已有 || fallback */ },
});
