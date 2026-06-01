// pages/profile/profile.js —— 个人中心页
//  用户信息 + 统计数字 + 菜单列表 + 退出登录
const app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: null,
    // 统计数据
    stats: {
      selling: 0,
      sold: 0,
      favorites: 0,
    },
    // 统计数据是否加载中
    statsLoading: true,
  },

  async onLoad() {
    await app.globalData.loginReadyPromise;
  },

  onShow() {
    this.loadUserInfo();
    if (app.globalData.isLoggedIn) {
      this.loadStats();
    }
  },

  // ==================== 加载用户信息 ====================
  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    this.setData({ userInfo });
  },

  // ==================== 加载统计数据 ====================
  async loadStats() {
    this.setData({ statsLoading: true });

    try {
      const db = wx.cloud.database();
      const openid = app.globalData.openid;
      const _ = db.command;

      // 并行查询 3 个统计数
      const [sellingRes, soldRes, favRes] = await Promise.all([
        db
          .collection("items")
          .where({ sellerId: openid, status: "selling" })
          .count(),
        db
          .collection("items")
          .where({ sellerId: openid, status: "sold" })
          .count(),
        db
          .collection("favorites")
          .where({ _openid: openid })
          .count(),
      ]);

      this.setData({
        stats: {
          selling: sellingRes.total || 0,
          sold: soldRes.total || 0,
          favorites: favRes.total || 0,
        },
        statsLoading: false,
      });
    } catch (err) {
      console.error("加载统计数据失败：", err);
      this.setData({ statsLoading: false });
    }
  },

  // ==================== 菜单导航 ====================
  onTapMenu(e) {
    const { id } = e.currentTarget.dataset;

    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    switch (id) {
      case "messages":
        wx.navigateTo({ url: "/pages/conversations/conversations" });
        break;
      case "myItems":
        wx.navigateTo({ url: "/pages/my-items/my-items" });
        break;
      case "myFavorites":
        wx.navigateTo({ url: "/pages/my-favorites/my-favorites" });
        break;
    }
  },

  // ==================== 退出登录 ====================
  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "确定要退出登录吗？退出后需重新注册",
      confirmColor: "#FF4D4D",
      success: (res) => {
        if (res.confirm) {
          app.clearLoginState();
          this.setData({
            userInfo: null,
            stats: { selling: 0, sold: 0, favorites: 0 },
          });
          wx.reLaunch({ url: "/pages/guide/guide" });
        }
      },
    });
  },

  // 头像加载失败兜底
  onAvatarError() { /* src 已有 || fallback */ },

  // ==================== 重新登录（未登录状态） ====================
  onGoLogin() {
    wx.reLaunch({ url: "/pages/guide/guide" });
  },
});
