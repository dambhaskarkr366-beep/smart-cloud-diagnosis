// pages/conversations/conversations.js
const app = getApp();

Page({
  data: {
    conversations: [],
    loading: true,
    error: false,
  },

  async onLoad() {
    await app.globalData.loginReadyPromise;
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
  },

  async onShow() {
    this.loadConversations();
  },

  async loadConversations() {
    this.setData({ loading: true, error: false });
    try {
      const res = await wx.cloud.callFunction({ name: "getConversations" });
      if (res.result && res.result.code === 0) {
        let convs = res.result.data.conversations;

        // 收集所有云存储图片ID，批量转临时URL
        const cloudIds = [];
        convs.forEach(c => {
          if (c.itemImage && c.itemImage.startsWith("cloud://")) cloudIds.push(c.itemImage);
          if (c.otherUserAvatar && c.otherUserAvatar.startsWith("cloud://")) cloudIds.push(c.otherUserAvatar);
        });
        const urlMap = {};
        if (cloudIds.length > 0) {
          try {
            const tmp = await wx.cloud.getTempFileURL({ fileList: [...new Set(cloudIds)] });
            (tmp.fileList || []).forEach(f => { if (f.tempFileURL) urlMap[f.fileID] = f.tempFileURL; });
          } catch (e) { /* ignore */ }
        }

        convs = convs.map(c => ({
          ...c,
          lastTime: this.formatTime(c.lastTime),
          itemImage: urlMap[c.itemImage] || c.itemImage,
          otherUserAvatar: urlMap[c.otherUserAvatar] || c.otherUserAvatar,
        }));
        this.setData({ conversations: convs, loading: false });
      } else {
        throw new Error(res.result?.message || "加载失败");
      }
    } catch (err) {
      console.error(err);
      this.setData({ loading: false, error: true });
    }
  },

  onTapConversation(e) {
    const { userId, userName, itemId, avatar } = e.currentTarget.dataset;
    let url = `/pages/chat/chat?userId=${userId}&userName=${encodeURIComponent(userName)}&itemId=${itemId}`;
    if (avatar) url += `&avatar=${encodeURIComponent(avatar)}`;
    wx.navigateTo({ url });
  },

  formatTime(d) {
    if (!d) return "";
    const now = Date.now();
    const t = new Date(d).getTime();
    const diff = now - t;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return Math.floor(diff / 60000) + "分钟前";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "小时前";
    if (diff < 2592000000) return Math.floor(diff / 86400000) + "天前";
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },

  onAvatarError() { /* src 已有 || fallback */ },
  onThumbError() { /* src 已有 || fallback */ },

  onRetry() {
    this.loadConversations();
  },
});
