// pages/detail/detail.js —— 商品详情页
//  图片轮播 + 详情信息 + 卖家信息 + 收藏/联系操作
const app = getApp();

Page({
  data: {
    // 商品 ID
    itemId: "",
    // 商品完整数据
    item: null,
    // 图片轮播当前索引（1-based 显示用）
    swiperCurrent: 0,
    // 是否已收藏
    isFavorited: false,
    // 状态
    loading: true,
    error: false,
    errorMsg: "",
    // 收藏按钮动画
    favoriting: false,
  },

  async onLoad(options) {
    const { itemId } = options;
    if (!itemId) {
      wx.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({ itemId });
    await this.loadDetail();
    await this.checkFavoriteStatus();
  },

  // ==================== 加载商品详情 ====================
  async loadDetail() {
    this.setData({ loading: true, error: false });

    try {
      const res = await wx.cloud.callFunction({
        name: "getItemDetail",
        data: { itemId: this.data.itemId },
      });

      if (!res.result || res.result.code !== 0) {
        throw new Error(res.result?.message || "商品不存在");
      }

      const item = res.result.data.item;

      // 计算发布时间文本
      if (item.createdAt) {
        item.createdAtText = this.formatTime(item.createdAt);
      }

      // 云存储图片转临时 URL
      if (item.images && item.images.length > 0) {
        this.convertDetailImages(item);
      }

      // 设置页面标题为商品标题
      wx.setNavigationBarTitle({ title: item.title || "商品详情" });

      this.setData({ item, loading: false });
    } catch (err) {
      console.error("加载详情失败：", err);
      this.setData({
        loading: false,
        error: true,
        errorMsg: err.message || "加载失败",
      });
    }
  },

  // ==================== 检查收藏状态 ====================
  async checkFavoriteStatus() {
    try {
      const db = wx.cloud.database();
      const openid = app.globalData.openid;
      if (!openid) return;

      const res = await db
        .collection("favorites")
        .where({
          itemId: this.data.itemId,
          _openid: openid,
        })
        .count();

      this.setData({ isFavorited: res.total > 0 });
    } catch (err) {
      console.warn("检查收藏状态失败：", err);
    }
  },

  // 云存储图片 → 临时 HTTPS URL
  async convertDetailImages(item) {
    const cloudIds = item.images.filter(id => typeof id === "string" && id.startsWith("cloud://"));
    if (cloudIds.length === 0) return;
    try {
      const res = await wx.cloud.getTempFileURL({ fileList: cloudIds });
      const fileList = res.fileList || [];
      const tempUrls = [...item.images];
      fileList.forEach(f => {
        if (f.tempFileURL) {
          const idx = tempUrls.indexOf(f.fileID);
          if (idx !== -1) tempUrls[idx] = f.tempFileURL;
        }
      });
      this.setData({ "item.images": tempUrls });
    } catch (e) { /* ignore */ }
  },

  // ==================== 卖家头像加载兜底 ====================
  onSellerAvatarError() {
    this.setData({ "item.sellerAvatar": "/images/default-avatar.png" });
  },

  // ==================== swiper 图片加载兜底 ====================
  onSwiperImageError(e) {
    const { index } = e.currentTarget.dataset;
    const images = [...(this.data.item?.images || [])];
    if (images[index]) {
      images[index] = "/images/placeholder.png";
      this.setData({ "item.images": images });
    }
  },

  // ==================== 图片轮播 ====================
  onSwiperChange(e) {
    this.setData({ swiperCurrent: e.detail.current });
  },

  // 预览大图
  onPreviewImage() {
    const { item, swiperCurrent } = this.data;
    if (!item || !item.images || item.images.length === 0) return;
    wx.previewImage({
      urls: item.images,
      current: item.images[swiperCurrent] || item.images[0],
    });
  },

  // ==================== 收藏 / 取消收藏 ====================
  async onToggleFavorite() {
    if (this.data.favoriting) return;
    this.setData({ favoriting: true });

    try {
      const res = await wx.cloud.callFunction({
        name: "toggleFavorite",
        data: { itemId: this.data.itemId },
      });

      if (!res.result || res.result.code !== 0) {
        throw new Error(res.result?.message || "操作失败");
      }

      const { isFavorited } = res.result.data;

      // 更新本地状态
      this.setData({ isFavorited });

      // 更新 item.favorCount
      const item = this.data.item;
      const delta = isFavorited ? 1 : -1;
      this.setData({
        "item.favorCount": Math.max(0, (item.favorCount || 0) + delta),
      });

      wx.showToast({
        title: isFavorited ? "已收藏" : "已取消收藏",
        icon: "none",
      });
    } catch (err) {
      console.error("收藏操作失败：", err);
      wx.showToast({ title: "操作失败", icon: "none" });
    } finally {
      this.setData({ favoriting: false });
    }
  },

  // ==================== 联系卖家 ====================
  async onContactSeller() {
    const { item } = this.data;
    if (!item) return;

    // contactCount +1（客户端直接操作，无需等云函数返回）
    this.incrementContactCount();

    // 跳转到聊天页
    const userId = item.sellerId || item._openid;
    const userName = item.sellerName || "卖家";

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}&userName=${encodeURIComponent(userName)}&itemId=${item._id}`,
    });
  },

  // 联系数 +1（乐观更新）
  async incrementContactCount() {
    try {
      const db = wx.cloud.database();
      const _ = db.command;
      await db
        .collection("items")
        .doc(this.data.itemId)
        .update({
          data: { contactCount: _.inc(1) },
        });
      // 乐观更新本地
      this.setData({
        "item.contactCount": (this.data.item.contactCount || 0) + 1,
      });
    } catch (err) {
      console.warn("更新联系数失败：", err);
    }
  },

  // ==================== 工具：时间格式化 ====================
  /**
   * 将时间戳/Date 转换为 "x分钟前 / x小时前 / x天前" 格式
   */
  formatTime(dateStr) {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    if (diff < 60 * 1000) return "刚刚";
    if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + "分钟前";
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / (3600 * 1000)) + "小时前";
    if (diff < 30 * 24 * 60 * 60 * 1000) return Math.floor(diff / (86400 * 1000)) + "天前";

    // 超过30天显示日期
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  // ==================== 返回上一页 ====================
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  // ==================== 分享 ====================
  onShareAppMessage() {
    const { item } = this.data;
    return {
      title: item ? item.title : "发现一个好物",
      path: `/pages/detail/detail?itemId=${this.data.itemId}`,
      imageUrl: item?.images?.[0] || "",
    };
  },

  // ==================== 错误重试 ====================
  onRetry() {
    this.loadDetail();
  },
});
