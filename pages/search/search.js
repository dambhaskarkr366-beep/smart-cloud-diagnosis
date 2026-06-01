// pages/search/search.js —— 搜索结果页
//  复用首页瀑布流布局 + 云函数调用（带 keyword 参数）
Page({
  data: {
    // ===== 搜索关键词 =====
    keyword: "",

    // ===== 分类 =====
    tabs: ["全部", "数码", "教材书籍", "生活用品", "服装", "乐器", "运动"],
    activeTab: "全部",

    // ===== 瀑布流双列数据 =====
    leftList: [],
    rightList: [],

    // ===== 分页 =====
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,

    // ===== 状态 =====
    loading: true,
    loadingMore: false,
    refreshing: false,
    error: false,
    errorMsg: "",
  },

  onLoad(options) {
    const keyword = decodeURIComponent(options.keyword || "");
    this.setData({ keyword });

    if (keyword) {
      this.loadItems(true);
    } else {
      // 没有关键词，显示空状态
      this.setData({ loading: false });
    }
  },

  // ==================== 搜索输入 ====================
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;

    // 保存到本地搜索历史（最近10条，去重）
    this.saveSearchHistory(keyword);

    this.setData({ page: 1, hasMore: true, leftList: [], rightList: [] });
    this.loadItems(true);
  },

  // 保存搜索关键词到本地历史
  saveSearchHistory(keyword) {
    let history = wx.getStorageSync("searchHistory") || [];
    // 去重：移除旧的出现
    history = history.filter((k) => k !== keyword);
    // 插入到最前面
    history.unshift(keyword);
    // 最多保留10条
    history = history.slice(0, 10);
    wx.setStorageSync("searchHistory", history);
  },

  // ==================== 下拉刷新 ====================
  async onPullDownRefresh() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    await this.loadItems(true);
    wx.stopPullDownRefresh();
    this.setData({ refreshing: false });
  },

  // ==================== 上拉加载更多 ====================
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true, page: this.data.page + 1 });
    await this.loadItems(false);
    this.setData({ loadingMore: false });
  },

  // ==================== 核心：搜索加载 ====================
  async loadItems(reset = true) {
    const { keyword, activeTab, page, pageSize } = this.data;

    if (!keyword || !keyword.trim()) {
      this.setData({ loading: false });
      return;
    }

    if (reset) {
      this.setData({ leftList: [], rightList: [], error: false, errorMsg: "" });
    }

    this.setData({ loading: reset && page === 1 });

    try {
      // 读取搜索历史传给云函数
      const searchHistory = wx.getStorageSync("searchHistory") || [];

      const res = await wx.cloud.callFunction({
        name: "getRecommendList",
        data: {
          keyword: keyword.trim(),
          category: activeTab,
          page,
          pageSize,
          searchHistory,
        },
      });

      if (!res.result || res.result.code !== 0) {
        throw new Error(res.result?.message || "请求失败");
      }

      const { list, total, hasMore: more } = res.result.data;

      // 云存储图片转临时 URL
      const convertedList = await this.convertImages(list);

      // 分配到瀑布流
      if (reset) {
        this.distributeItems(convertedList);
      } else {
        this.appendItems(convertedList);
      }

      this.setData({ total, hasMore: more, loading: false });
    } catch (err) {
      console.error("搜索失败：", err);
      this.setData({
        loading: false,
        loadingMore: false,
        error: true,
        errorMsg: err.message || "搜索失败，请重试",
      });
      if (!reset) this.setData({ page: this.data.page - 1 });
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
    const unique = [...new Set(ids)];
    const map = {};
    for (let i = 0; i < unique.length; i += 50) {
      try {
        const tmp = await wx.cloud.getTempFileURL({ fileList: unique.slice(i, i + 50) });
        (tmp.fileList || []).forEach(f => { if (f.tempFileURL && f.fileID) map[f.fileID] = f.tempFileURL; });
      } catch (e) { /* ignore */ }
    }
    return list.map(item => ({
      ...item,
      images: (item.images || []).map(id => map[id] || id),
    }));
  },

  // ==================== 瀑布流分配 ====================
  distributeItems(list) {
    const leftList = [];
    const rightList = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) leftList.push(item);
      else rightList.push(item);
    });
    this.setData({ leftList, rightList });
  },

  appendItems(list) {
    const leftList = [...this.data.leftList];
    const rightList = [...this.data.rightList];
    list.forEach((item) => {
      if (leftList.length <= rightList.length) leftList.push(item);
      else rightList.push(item);
    });
    this.setData({ leftList, rightList });
  },

  // ==================== 分类切换 ====================
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      leftList: [],
      rightList: [],
    });
    this.loadItems(true);
  },

  // ==================== 清空搜索 ====================
  onClearSearch() {
    this.setData({
      keyword: "",
      leftList: [],
      rightList: [],
      total: 0,
      hasMore: true,
      page: 1,
      loading: false,
    });
  },

  // ==================== 错误重试 ====================
  onRetry() {
    this.setData({ page: 1, hasMore: true, error: false });
    this.loadItems(true);
  },
});
