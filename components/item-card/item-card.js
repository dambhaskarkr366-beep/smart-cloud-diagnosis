// components/item-card/item-card.js —— 商品卡片组件
//  用于首页双列瀑布流 & 搜索结果列表
//  传入 item 对象即可渲染：商品图、标题、价格、地点、卖家信息（可选）
Component({
  properties: {
    // 商品数据对象
    //   { _id, title, price, images[], condition, location, tradeMethod,
    //     sellerName, sellerAvatar, viewCount, createdAt }
    item: {
      type: Object,
      value: null,
    },
    // 是否显示地点
    showLocation: {
      type: Boolean,
      value: true,
    },
    // 是否显示卖家信息行
    showSeller: {
      type: Boolean,
      value: false,
    },
    // 精简模式：只显示图片+标题+价格，隐藏地点/浏览/卖家
    compact: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    // 兜底图（图片加载失败时使用）
    fallbackImage: "/images/placeholder.png",
    // 新旧程度 ↔ 标签颜色映射
    conditionColorMap: {
      "几乎全新": "tag-green",
      "轻微使用": "tag-blue",
      "明显痕迹": "tag-orange",
      "较旧": "tag-gray",
    },
  },

  observers: {
    // 监听 item 变化，预计算展示字段 + 兜底逻辑 + 云文件转临时URL
    item(item) {
      if (!item) return;
      // 若 images 为空，补充兜底图
      if (!item.images || item.images.length === 0) {
        this.setData({ "item.images": [this.data.fallbackImage] });
      }
      // 预计算浏览量展示文本
      const vc = item.viewCount || 0;
      let viewCountText = String(vc);
      if (vc >= 1000) { viewCountText = Math.round(vc / 1000) + "k"; }
      this.setData({ "item._viewCountText": viewCountText });

      // 云存储文件ID转临时URL（确保图片在任何端都能显示）
      this.convertImagesToTempUrls(item);
    },
  },

  methods: {
    // 云存储 fileID → 临时 HTTPS URL（解决 B 端图片不显示）
    async convertImagesToTempUrls(item) {
      if (!item.images || item.images.length === 0) return;
      const cloudIds = item.images.filter(id => typeof id === "string" && id.startsWith("cloud://"));
      if (cloudIds.length === 0) return;

      try {
        const res = await wx.cloud.getTempFileURL({ fileList: cloudIds });
        const fileList = res.fileList || [];
        const newImages = [...item.images];
        let changed = false;
        fileList.forEach(f => {
          if (f.tempFileURL && f.fileID) {
            const idx = newImages.indexOf(f.fileID);
            if (idx !== -1) { newImages[idx] = f.tempFileURL; changed = true; }
          }
        });
        if (changed) this.setData({ "item.images": newImages });
      } catch (e) {
        // 转换失败保留原始 cloud:// URL
      }
    },

    // 点击卡片 → 跳转详情页
    onTap() {
      const item = this.data.item;
      if (item && item._id) {
        wx.navigateTo({
          url: `/pages/detail/detail?itemId=${item._id}`,
        });
      }
      this.triggerEvent("tap", { item });
    },

    // 图片加载失败 → 尝试下一张，全失败则用兜底图
    onImageError(e) {
      const { index } = e.currentTarget.dataset;
      const images = this.data.item.images || [];
      const fallback = this.data.fallbackImage;

      // 尝试 images 中的下一张
      const nextIndex = Number(index) + 1;
      if (nextIndex < images.length && images[nextIndex] !== fallback) {
        // 不做替换，由 wxml 侧处理（用 wx:if 切换）
        return;
      }
      // 没有更多图片 → 兜底
      this.setData({
        [`item.images[${index}]`]: fallback,
      });
    },

    // 预览大图
    onPreviewImage(e) {
      const { current } = e.currentTarget.dataset;
      const images = this.data.item.images || [];
      if (images.length === 0) return;
      wx.previewImage({
        urls: images,
        current: current || images[0],
      });
    },

    // 卖家头像加载失败兜底
    onSellerAvatarError() {
      this.setData({ "item.sellerAvatar": "/images/default-avatar.png" });
    },

    // 获取标签 css 类名
    getConditionClass(condition) {
      return this.data.conditionColorMap[condition] || "tag-gray";
    },
  },
});
