// pages/chat/chat.js —— 聊天页
//  消息列表 + 发送消息 + 轮询获取新消息 + 关联商品信息条
const app = getApp();

Page({
  data: {
    // ===== 聊天对象 =====
    chatUserId: "",      // 对方 openid
    chatUserName: "",    // 对方昵称
    chatUserAvatar: "",  // 对方头像

    // ===== 关联商品 =====
    itemId: "",
    item: null,

    // ===== 消息 =====
    messages: [],
    inputText: "",

    // ===== 滚动 =====
    scrollToView: "",  // 用于 scroll-into-view

    // ===== 状态 =====
    loading: true,
    sending: false,
    error: false,

    // ===== 轮询 =====
    pollTimer: null,
    lastCreatedAt: null,

    // ===== 自己的信息 =====
    myOpenid: "",
    myAvatar: "",
  },

  async onLoad(options) {
    const { userId, userName, itemId, avatar } = options;
    if (!userId) {
      wx.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }

    this.setData({
      chatUserId: userId,
      chatUserName: decodeURIComponent(userName || "用户"),
      itemId: itemId || "",
      myOpenid: app.globalData.openid,
      myAvatar: app.globalData.userInfo?.avatarUrl || "",
    });

    // 获取对方头像（优先用传入的，否则查询）
    if (avatar) {
      this.setData({ chatUserAvatar: decodeURIComponent(avatar) });
    } else {
      this.fetchOtherUserAvatar(userId);
    }

    await this.loadChatData();
    this.startPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  // 获取对方用户头像
  async fetchOtherUserAvatar(userId) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection("users")
        .where({ _openid: userId })
        .field({ avatarUrl: true, nickName: true })
        .get();
      if (res.data && res.data.length > 0) {
        const u = res.data[0];
        if (u.avatarUrl) this.setData({ chatUserAvatar: u.avatarUrl });
        if (u.nickName) this.setData({ chatUserName: u.nickName });
      }
    } catch (e) { /* ignore */ }
  },

  // ==================== 加载聊天数据 ====================
  async loadChatData() {
    this.setData({ loading: true, error: false });

    try {
      // 并行加载：商品信息 + 消息列表
      const promises = [];

      // 加载关联商品信息
      if (this.data.itemId) {
        promises.push(this.loadItemInfo());
      } else {
        promises.push(Promise.resolve());
      }

      // 加载消息列表
      promises.push(this.loadMessages());

      await Promise.all(promises);

      this.setData({ loading: false });
      this.scrollToBottom();
    } catch (err) {
      console.error("加载聊天数据失败：", err);
      this.setData({ loading: false, error: true });
    }
  },

  // 加载关联商品简略信息
  async loadItemInfo() {
    try {
      const db = wx.cloud.database();
      const res = await db
        .collection("items")
        .doc(this.data.itemId)
        .field({ title: true, price: true, images: true, status: true })
        .get();

      if (res.data) {
        const item = res.data;
        if (!item.images || item.images.length === 0) {
          item.images = ["/images/placeholder.png"];
        }
        // 云存储图片转临时URL
        const cloudIds = item.images.filter(id => typeof id === "string" && id.startsWith("cloud://"));
        if (cloudIds.length > 0) {
          try {
            const tmp = await wx.cloud.getTempFileURL({ fileList: cloudIds });
            (tmp.fileList || []).forEach(f => {
              if (f.tempFileURL) {
                const idx = item.images.indexOf(f.fileID);
                if (idx !== -1) item.images[idx] = f.tempFileURL;
              }
            });
          } catch (e) { /* ignore */ }
        }
        this.setData({ item });
      }
    } catch (err) {
      console.warn("加载商品信息失败：", err);
    }
  },

  // 加载消息列表
  async loadMessages() {
    try {
      const res = await wx.cloud.callFunction({
        name: "getMessages",
        data: {
          to: this.data.chatUserId,
          itemId: this.data.itemId,
        },
      });

      if (res.result && res.result.code === 0) {
        const { messages } = res.result.data;

        this.setData({ messages });

        // 记录最新消息时间，用于增量轮询
        if (messages.length > 0) {
          this.setData({
            lastCreatedAt: messages[messages.length - 1].createdAt,
          });
        }
      }
    } catch (err) {
      console.error("加载消息失败：", err);
    }
  },

  // ==================== 图片消息 ====================
  async onChooseImage() {
    let tempFilePath = "";
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });
      if (res.tempFiles.length > 0) tempFilePath = res.tempFiles[0].tempFilePath;
    } catch (err) {
      if (err.errMsg && err.errMsg.includes("cancel")) return;
      return;
    }
    if (!tempFilePath) return;

    wx.showLoading({ title: "发送中…", mask: true });
    try {
      const cloudPath = `chat/${app.globalData.openid}_${Date.now()}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: tempFilePath });
      wx.hideLoading();
      await this.doSendMessage(uploadRes.fileID, "image");
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: "发送失败", icon: "none" });
    }
  },

  // 预览聊天图片
  onPreviewMsgImage(e) {
    const { url } = e.currentTarget.dataset;
    if (url) wx.previewImage({ urls: [url], current: url });
  },

  // ==================== 发送文字消息 ====================
  async onSendMessage() {
    const content = this.data.inputText.trim();
    if (!content || this.data.sending) return;
    this.setData({ inputText: "" });
    await this.doSendMessage(content, "text");
  },

  // 核心发送逻辑（文本/图片共用）
  async doSendMessage(content, type = "text") {
    if (this.data.sending) return;
    this.setData({ sending: true });

    const tempMsg = {
      _id: `temp_${Date.now()}`,
      content,
      from: app.globalData.openid,
      isMine: true,
      type,
      createdAt: new Date(),
      sending: true,
    };

    const messages = [...this.data.messages, tempMsg];
    this.setData({ messages });
    this.scrollToBottom();

    try {
      const res = await wx.cloud.callFunction({
        name: "sendMessage",
        data: {
          to: this.data.chatUserId,
          itemId: this.data.itemId,
          content,
          type,
        },
      });

      if (res.result && res.result.code === 0) {
        const idx = messages.findIndex((m) => m._id === tempMsg._id);
        if (idx !== -1) {
          messages[idx] = { ...messages[idx], _id: res.result.data.messageId, sending: false };
          this.setData({ messages, lastCreatedAt: new Date() });
        }
      } else {
        throw new Error(res.result?.message || "发送失败");
      }
    } catch (err) {
      const idx = messages.findIndex((m) => m._id === tempMsg._id);
      if (idx !== -1) { messages[idx].sendFailed = true; this.setData({ messages }); }
      wx.showToast({ title: "发送失败", icon: "none" });
    } finally {
      this.setData({ sending: false });
    }
  },

  // 重发失败消息
  async onResend(e) {
    const { index } = e.currentTarget.dataset;
    const msg = this.data.messages[index];
    if (!msg) return;

    // 删除旧消息
    const messages = [...this.data.messages];
    messages.splice(index, 1);
    this.setData({ messages, inputText: msg.content });
    this.onSendMessage();
  },

  // ==================== 轮询 ====================
  startPolling() {
    this.stopPolling();
    // 每 3 秒拉一次新消息
    this._pollTimer = setInterval(() => {
      this.pollNewMessages();
    }, 3000);
  },

  stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  },

  async pollNewMessages() {
    try {
      const res = await wx.cloud.callFunction({
        name: "getMessages",
        data: {
          to: this.data.chatUserId,
          itemId: this.data.itemId,
          lastCreatedAt: this.data.lastCreatedAt,
        },
      });

      if (res.result && res.result.code === 0) {
        const { messages: newMsgs } = res.result.data;

        if (newMsgs && newMsgs.length > 0) {
          const existingIds = new Set(this.data.messages.map(m => m._id));
          const trulyNew = newMsgs.filter(m => !existingIds.has(m._id));
          if (trulyNew.length > 0) {
            const messages = [...this.data.messages, ...trulyNew];
            this.setData({
              messages,
              lastCreatedAt: trulyNew[trulyNew.length - 1].createdAt,
            });
            this.scrollToBottom();
          }
        }
      }
    } catch (err) {
      // 轮询静默失败
    }
  },

  // ==================== UI 辅助 ====================
  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 滚动到底部
  scrollToBottom() {
    this.setData({ scrollToView: "" });
    // 下一帧设置，触发 scroll-into-view
    setTimeout(() => {
      this.setData({ scrollToView: "msg-bottom" });
    }, 100);
  },

  // 商品缩略图加载失败兜底
  onItemThumbError() {
    if (this.data.item) {
      this.setData({ "item.images[0]": "/images/placeholder.png" });
    }
  },

  // 头像加载失败兜底
  onAvatarError() { /* 已有 || fallback 在 src 里，此处静默 */ },

  // 聊天图片消息加载失败兜底
  onMsgImageError(e) {
    const { index } = e.currentTarget.dataset;
    const msgs = [...this.data.messages];
    if (msgs[index]) msgs[index].content = "/images/placeholder.png";
    this.setData({ messages: msgs });
  },

  // 点击关联商品 → 跳转详情
  onTapItem() {
    if (this.data.itemId) {
      wx.navigateTo({
        url: `/pages/detail/detail?itemId=${this.data.itemId}`,
      });
    }
  },
});
