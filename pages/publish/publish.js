// pages/publish/publish.js —— 发布商品页
//  图片上传（wx.chooseMedia → 云存储） + 表单校验 + 云函数提交
const app = getApp();

Page({
  data: {
    // ===== 图片 =====
    images: [],           // 已上传的云存储 fileID 列表
    uploading: false,     // 是否正在上传
    uploadProgress: 0,    // 上传进度 0-100

    // ===== 表单 =====
    form: {
      title: "",
      originalPrice: "",
      price: "",
      category: "",
      condition: "几乎全新",
      location: "",
      description: "",
      tradeMethod: "自提",
    },

    // ===== 选项列表 =====
    categories: ["数码", "教材书籍", "生活用品", "服装", "乐器", "运动"],
    conditions: ["几乎全新", "轻微使用", "明显痕迹", "较旧"],
    tradeMethods: ["自提", "快递到付"],

    // ===== 选择器索引（用于 bindchange） =====
    categoryIndex: -1,
    conditionIndex: 0,
    tradeMethodIndex: 0,

    // ===== 状态 =====
    submitting: false,

    // ===== 最大图片数 =====
    maxImages: 6,
  },

  async onLoad() {
    // 等待登录态
    await app.globalData.loginReadyPromise;

    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => wx.switchTab({ url: "/pages/profile/profile" }), 800);
    }
  },

  // ==================== 图片选择与上传 ====================
  /**
   * 调用 wx.chooseMedia 选择图片，然后依次上传到云存储
   */
  async onChooseImage() {
    const { images, maxImages } = this.data;
    const remaining = maxImages - images.length;

    if (remaining <= 0) {
      wx.showToast({ title: `最多上传${maxImages}张图片`, icon: "none" });
      return;
    }

    // 1. 选择图片
    let tempFiles = [];
    try {
      const res = await wx.chooseMedia({
        count: remaining,
        mediaType: ["image"],
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });
      tempFiles = res.tempFiles;
    } catch (err) {
      if (err.errMsg && err.errMsg.includes("cancel")) return;
      console.error("选择图片失败：", err);
      return;
    }

    if (tempFiles.length === 0) return;

    // 2. 显示上传中
    wx.showLoading({ title: "上传中 0%", mask: true });
    this.setData({ uploading: true, uploadProgress: 0 });

    const uploadedIds = [];
    const total = tempFiles.length;

    try {
      for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        const ext = file.tempFilePath.split(".").pop() || "jpg";
        const cloudPath = `items/images/${app.globalData.openid}_${Date.now()}_${i}.${ext}`;

        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: file.tempFilePath,
        });

        uploadedIds.push(uploadRes.fileID);

        // 更新进度
        const progress = Math.round(((i + 1) / total) * 100);
        wx.showLoading({ title: `上传中 ${progress}%`, mask: true });
        this.setData({ uploadProgress: progress });
      }

      // 3. 追加到图片列表
      this.setData({
        images: [...images, ...uploadedIds],
        uploading: false,
      });
      wx.hideLoading();
    } catch (err) {
      console.error("上传失败：", err);
      wx.hideLoading();
      wx.showToast({ title: "图片上传失败", icon: "none" });
      this.setData({ uploading: false });
    }
  },

  // 预览已上传的图片
  onPreviewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    if (images.length === 0) return;
    wx.previewImage({
      urls: images,
      current: images[index] || images[0],
    });
  },

  // 删除图片
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  // ==================== 表单输入 ====================
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  // ==================== 地图选点 / 定位 ====================
  onChooseLocation() {
    wx.showLoading({ title: "定位中…", mask: true });

    // 超时保护：3秒后自动关闭 loading
    const timer = setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: "定位超时，请手动输入", icon: "none" });
    }, 3000);

    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        clearTimeout(timer);
        wx.hideLoading();
        const loc = `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
        this.setData({ "form.location": loc });
        wx.showToast({ title: "已获取当前位置", icon: "success" });
      },
      fail: (err) => {
        clearTimeout(timer);
        wx.hideLoading();
        console.error("定位失败：", err);
        // 检查是否权限问题
        if (err.errMsg && err.errMsg.includes("auth deny")) {
          wx.showModal({
            title: "需要位置权限",
            content: "请在设置中允许小程序获取位置",
            confirmText: "去设置",
            success: (modalRes) => {
              if (modalRes.confirm) wx.openSetting();
            },
          });
        } else {
          wx.showToast({ title: "定位失败，请手动输入", icon: "none" });
        }
      },
    });
  },

  // ==================== Picker 选择 ====================
  // 分类
  onCategoryPickerChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      "form.category": this.data.categories[index],
    });
  },

  // 新旧程度
  onConditionPickerChange(e) {
    const index = e.detail.value;
    this.setData({
      conditionIndex: index,
      "form.condition": this.data.conditions[index],
    });
  },

  // 交易方式
  onTradeMethodPickerChange(e) {
    const index = e.detail.value;
    this.setData({
      tradeMethodIndex: index,
      "form.tradeMethod": this.data.tradeMethods[index],
    });
  },

  // ==================== 提交 ====================
  async onSubmit() {
    // 表单校验
    const { form, images } = this.data;

    if (images.length === 0) {
      wx.showToast({ title: "请至少上传一张图片", icon: "none" });
      return;
    }
    if (!form.title.trim()) {
      wx.showToast({ title: "请输入商品标题", icon: "none" });
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      wx.showToast({ title: "请输入有效的价格", icon: "none" });
      return;
    }
    if (!form.category) {
      wx.showToast({ title: "请选择分类", icon: "none" });
      return;
    }
    if (!form.location.trim()) {
      wx.showToast({ title: "请输入交易地点", icon: "none" });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: "发布中…", mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: "publishItem",
        data: {
          ...form,
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          price: Number(form.price),
          images,
        },
      });

      if (!res.result || res.result.code !== 0) {
        throw new Error(res.result?.message || "发布失败");
      }

      wx.hideLoading();
      wx.showToast({ title: "发布成功！", icon: "success" });

      // 重置表单
      this.resetForm();

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({ url: "/pages/index/index" });
      }, 1000);
    } catch (err) {
      wx.hideLoading();
      console.error("发布失败：", err);
      wx.showToast({ title: err.message || "发布失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 重置表单
  resetForm() {
    this.setData({
      images: [],
      form: {
        title: "",
        originalPrice: "",
        price: "",
        category: "",
        condition: "几乎全新",
        location: "",
        description: "",
        tradeMethod: "自提",
      },
      categoryIndex: -1,
      conditionIndex: 0,
      tradeMethodIndex: 0,
    });
  },

  // 已上传图片加载失败兜底
  onUploadedImageError(e) {
    const { index } = e.currentTarget.dataset;
    const images = [...this.data.images];
    if (images[index]) images[index] = "/images/placeholder.png";
    this.setData({ images });
  },
});
