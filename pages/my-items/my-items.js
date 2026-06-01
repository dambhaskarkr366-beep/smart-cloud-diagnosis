// pages/my-items/my-items.js —— 我发布的商品
const app = getApp();

Page({
  data: {
    items: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: true,
    loadingMore: false,
    error: false,
  },

  async onLoad() {
    await app.globalData.loginReadyPromise;
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.loadItems(true);
  },

  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    await this.loadItems(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true, page: this.data.page + 1 });
    await this.loadItems(false);
    this.setData({ loadingMore: false });
  },

  async loadItems(reset = true) {
    if (reset) this.setData({ items: [], error: false });
    this.setData({ loading: reset && this.data.page === 1 });

    try {
      const db = wx.cloud.database();
      const openid = app.globalData.openid;

      const res = await db
        .collection("items")
        .where({ sellerId: openid })
        .orderBy("createdAt", "desc")
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get();

      const listRaw = res.data || [];
      // 批量转换云存储图片
      const allCloudIds = [];
      listRaw.forEach(item => {
        if (item.images) item.images.forEach(id => {
          if (typeof id === "string" && id.startsWith("cloud://")) allCloudIds.push(id);
        });
      });
      const tempUrlMap = {};
      if (allCloudIds.length > 0) {
        try {
          const tmp = await wx.cloud.getTempFileURL({ fileList: [...new Set(allCloudIds)] });
          (tmp.fileList || []).forEach(f => { if (f.tempFileURL) tempUrlMap[f.fileID] = f.tempFileURL; });
        } catch (e) { /* ignore */ }
      }
      const list = listRaw.map(item => ({
        ...item,
        images: (item.images && item.images.length > 0)
          ? item.images.map(id => tempUrlMap[id] || id)
          : ["/images/placeholder.png"],
      }));
      const items = reset ? list : [...this.data.items, ...list];

      this.setData({
        items,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
      });
    } catch (err) {
      console.error("加载失败：", err);
      this.setData({ loading: false, error: true });
    }
  },

  onImageError(e) {
    const { index } = e.currentTarget.dataset;
    const items = [...this.data.items];
    if (items[index] && items[index].images) {
      items[index].images[0] = "/images/placeholder.png";
      this.setData({ items });
    }
  },

  onTapItem(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?itemId=${id}` });
  },

  onRetry() {
    this.setData({ page: 1, hasMore: true });
    this.loadItems(true);
  },
});
