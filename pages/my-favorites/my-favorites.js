// pages/my-favorites/my-favorites.js —— 我的收藏
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
    this.loadFavorites(true);
  },

  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    await this.loadFavorites(true);
    wx.stopPullDownRefresh();
  },

  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true, page: this.data.page + 1 });
    await this.loadFavorites(false);
    this.setData({ loadingMore: false });
  },

  async loadFavorites(reset = true) {
    if (reset) this.setData({ items: [], error: false });
    this.setData({ loading: reset && this.data.page === 1 });

    try {
      const db = wx.cloud.database();
      const openid = app.globalData.openid;
      const pageSize = this.data.pageSize;
      const skip = (this.data.page - 1) * pageSize;

      // 1. 查收藏列表（按时间倒序）
      const favRes = await db
        .collection("favorites")
        .where({ _openid: openid })
        .orderBy("createdAt", "desc")
        .skip(skip)
        .limit(pageSize)
        .get();

      const favs = favRes.data || [];

      if (favs.length === 0) {
        this.setData({ items: reset ? [] : this.data.items, hasMore: false, loading: false });
        return;
      }

      // 2. 根据 itemId 批量查询商品
      const itemIds = favs.map((f) => f.itemId);
      const _ = db.command;
      const itemRes = await db
        .collection("items")
        .where({ _id: _.in(itemIds) })
        .get();

      // 保持收藏顺序
      const itemMap = {};
      (itemRes.data || []).forEach((item) => {
        itemMap[item._id] = item;
      });

      let items = favs
        .map((fav) => itemMap[fav.itemId])
        .filter(Boolean);

      // 云存储图片转临时 URL
      items = await this.convertImages(items);

      this.setData({
        items: reset ? items : [...this.data.items, ...items],
        hasMore: favs.length >= pageSize,
        loading: false,
      });
    } catch (err) {
      console.error("加载收藏失败：", err);
      this.setData({ loading: false, error: true });
    }
  },

  async convertImages(list) {
    const ids = [];
    list.forEach(item => {
      if (item.images) item.images.forEach(id => {
        if (typeof id === "string" && id.startsWith("cloud://")) ids.push(id);
      });
    });
    if (ids.length === 0) return list;
    const map = {};
    try {
      const tmp = await wx.cloud.getTempFileURL({ fileList: [...new Set(ids)] });
      (tmp.fileList || []).forEach(f => { if (f.tempFileURL && f.fileID) map[f.fileID] = f.tempFileURL; });
    } catch (e) { /* ignore */ }
    return list.map(item => ({
      ...item,
      images: (item.images || []).map(id => map[id] || id),
    }));
  },

  onTapItem(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?itemId=${id}` });
  },

  onRetry() {
    this.setData({ page: 1, hasMore: true });
    this.loadFavorites(true);
  },
});
