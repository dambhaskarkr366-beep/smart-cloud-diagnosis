// pages/index/index.js —— 首页
//  双列瀑布流 + 分类Tab + 搜索 + 下拉刷新/上拉加载
const app = getApp();

Page({
  data: {
    // ===== 分类 =====
    tabs: ["全部", "数码", "教材书籍", "生活用品", "服装", "乐器", "运动"],
    activeTab: "全部",

    // ===== 瀑布流双列数据 =====
    leftList: [],   // 左列商品
    rightList: [],  // 右列商品

    // ===== 分页 =====
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,

    // ===== 搜索 =====
    searchKeyword: "",

    // ===== 状态 =====
    loading: true,       // 首次加载
    loadingMore: false,  // 加载更多
    refreshing: false,   // 下拉刷新
    error: false,        // 加载失败
    errorMsg: "",
  },

  async onLoad() {
    // 等待 app.js 登录态初始化完成
    await app.globalData.loginReadyPromise;

    // 未注册 → 引导页
    if (!app.globalData.hasGuided) {
      wx.reLaunch({ url: "/pages/guide/guide" });
      return;
    }

    this.loadItems();
  },

  // 页面显示时（从详情页/发布页返回）—— 可在此处刷新
  onShow() {
    // 仅在已加载过数据的情况下，静默刷新第一页（不显示 loading）
    if (this._hasLoaded && !this.data.loading) {
      // 可选：静默刷新
    }
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

  // ==================== 核心：加载商品列表 ====================
  /**
   * 调用 getRecommendList 云函数获取商品
   * @param {boolean} reset - true 表示刷新（清空并重新加载），false 表示追加
   */
  async loadItems(reset = true) {
    const { activeTab, page, pageSize } = this.data;

    // 重置时清空列表
    if (reset) {
      this.setData({ leftList: [], rightList: [], error: false, errorMsg: "" });
    }

    this.setData({ loading: reset && page === 1 });

    try {
      // 读取本地搜索历史
      const searchHistory = wx.getStorageSync("searchHistory") || [];

      const res = await wx.cloud.callFunction({
        name: "getRecommendList",
        data: {
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

      // 云存储图片转临时 URL（解决跨用户访问权限问题）
      const convertedList = await this.convertItemImages(list);

      // 将新数据分配到瀑布流左右列
      if (reset) {
        this.distributeItems(convertedList);
      } else {
        this.appendItems(convertedList);
      }

      this.setData({
        total,
        hasMore: more,
        loading: false,
      });

      this._hasLoaded = true;
    } catch (err) {
      console.error("加载商品失败：", err);
      this.setData({
        loading: false,
        loadingMore: false,
        error: true,
        errorMsg: err.message || "网络异常，请下拉刷新重试",
      });

      // 回退页码
      if (!reset) {
        this.setData({ page: this.data.page - 1 });
      }
    }
  },

  // 批量将 cloud:// 图片转临时 HTTPS URL（单次最多50个，超量分批）
  async convertItemImages(list) {
    const allCloudIds = [];
    list.forEach(item => {
      if (item.images) item.images.forEach(id => {
        if (typeof id === "string" && id.startsWith("cloud://")) allCloudIds.push(id);
      });
    });
    if (allCloudIds.length === 0) return list;

    const unique = [...new Set(allCloudIds)];
    const urlMap = {};
    // 分批，每批最多50个
    for (let i = 0; i < unique.length; i += 50) {
      try {
        const tmp = await wx.cloud.getTempFileURL({ fileList: unique.slice(i, i + 50) });
        (tmp.fileList || []).forEach(f => {
          if (f.tempFileURL && f.fileID) urlMap[f.fileID] = f.tempFileURL;
        });
      } catch (e) { /* ignore */ }
    }

    return list.map(item => ({
      ...item,
      images: (item.images || []).map(id => urlMap[id] || id),
    }));
  },

  // ==================== 瀑布流分配 ====================
  /**
   * 将商品列表分配到左右两列（重置模式）
   * 简单交替：偶数索引放左列，奇数索引放右列
   */
  distributeItems(list) {
    const leftList = [];
    const rightList = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) {
        leftList.push(item);
      } else {
        rightList.push(item);
      }
    });
    this.setData({ leftList, rightList });
  },

  /**
   * 追加商品到瀑布流（加载更多模式）
   * 新商品追加到当前较短的列，保持视觉平衡
   */
  appendItems(list) {
    const leftList = [...this.data.leftList];
    const rightList = [...this.data.rightList];

    list.forEach((item) => {
      if (leftList.length <= rightList.length) {
        leftList.push(item);
      } else {
        rightList.push(item);
      }
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

  // ==================== 搜索 ====================
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearchConfirm() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`,
    });
  },

  // 点击搜索框（不输入直接跳转）
  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  // ==================== 事件占位 ====================
  // 阻止搜索框 tap 事件冒泡到搜索栏
  noop() {},

  // ==================== 错误重试 ====================
  onRetry() {
    this.setData({ page: 1, hasMore: true, error: false });
    this.loadItems(true);
  },
});
