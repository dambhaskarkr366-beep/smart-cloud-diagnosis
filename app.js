// app.js —— 校园二手交易小程序入口
App({
  /**
   * 小程序启动时执行
   * 1. 初始化云开发环境
   * 2. 调用 wx.login 获取 openid（通过云函数 getOpenid）
   * 3. 检查 users 集合判断是否已注册
   * 4. resolve loginReadyPromise，通知各页面初始化完毕
   */
  /**
   * 全局未捕获错误处理
   */
  onError(err) {
    console.error("全局错误：", err);
    // 生产环境可上报到云函数做监控
  },

  /**
   * 网络状态监听
   */
  onNetworkStatusChange(res) {
    if (!res.isConnected) {
      wx.showToast({ title: "网络已断开", icon: "none", duration: 2000 });
    }
  },

  onLaunch() {
    // 构建 loginReadyPromise —— 页面通过 await app.globalData.loginReadyPromise 等待登录态就绪
    this.globalData.loginReadyPromise = new Promise((resolve, reject) => {
      this.globalData._resolveLoginReady = resolve;
      this.globalData._rejectLoginReady = reject;
    });

    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      this.globalData._resolveLoginReady(); // 即使失败也要 resolve，避免页面死等
      return;
    }

    wx.cloud.init({
      // env 参数说明：
      //   此处请填入环境 ID，环境 ID 可在云开发控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "cloud1-d9gt5ml5s45dc3054",
      traceUser: true,
    });

    // 启动登录态恢复（异步，完成后 resolve loginReadyPromise）
    this.restoreLoginState();
  },

  /**
   * 全局数据
   */
  globalData: {
    // 用户 openid
    openid: "",
    // 用户完整信息（来自 users 集合，包含 _id, school, college, grade, nickName, avatarUrl 等）
    userInfo: null,
    // 是否已登录（已绑定学校信息）
    isLoggedIn: false,
    // 是否已完成引导
    hasGuided: false,
    // Promise：resolve 时表示登录态初始化完毕，页面可安全读取 hasGuided / isLoggedIn
    loginReadyPromise: null,
    _resolveLoginReady: null,
    _rejectLoginReady: null,
  },

  /**
   * 恢复登录态
   * 优先从本地缓存读取；若无缓存则调用云函数 getOpenid 获取 openid
   * 完成后 resolve loginReadyPromise
   */
  async restoreLoginState() {
    try {
      const cachedOpenid = wx.getStorageSync("openid");
      const cachedUserInfo = wx.getStorageSync("userInfo");

      // 本地缓存命中 → 直接恢复
      if (cachedOpenid && cachedUserInfo) {
        this.globalData.openid = cachedOpenid;
        this.globalData.userInfo = cachedUserInfo;
        this.globalData.isLoggedIn = true;
        this.globalData.hasGuided = true;
        return;
      }

      // 本地无缓存 → 先调用 wx.login 获取临时 code（微信后台自动完成），
      // 再通过云函数 getOpenid 获取 openid
      await this.wxLoginAndFetchOpenid();
    } catch (err) {
      console.error("登录态恢复失败：", err);
    } finally {
      // 无论成功与否，resolve promise —— 页面不再死等
      if (this.globalData._resolveLoginReady) {
        this.globalData._resolveLoginReady();
      }
    }
  },

  /**
   * 调用 wx.login 获取临时 code，然后通过云函数 getOpenid 换取 openid
   * 同时查询 users 集合判断是否已注册
   */
  async wxLoginAndFetchOpenid() {
    // Step 1: 调用 wx.login 获取临时 code
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      console.error("wx.login 失败：未获取到 code");
      return;
    }

    // Step 2: 将 code 传入云函数（云函数内部通过 code 换取 openid）
    //   getOpenid 云函数也支持无 code 调用（从 wxContext 直接取 OPENID）
    const db = wx.cloud.database();
    let res;
    try {
      res = await wx.cloud.callFunction({
        name: "getOpenid",
        data: { code: loginRes.code },
      });
    } catch (callErr) {
      // 云函数可能还未部署，尝试无参调用
      console.warn("带 code 调用 getOpenid 失败，尝试无参调用：", callErr);
      res = await wx.cloud.callFunction({
        name: "getOpenid",
      });
    }

    if (!res || !res.result || res.result.code !== 0) {
      console.error("getOpenid 云函数返回异常：", res);
      return;
    }

    const openid = res.result.data.openid;
    this.globalData.openid = openid;
    wx.setStorageSync("openid", openid);

    // Step 3: 查询 users 集合，判断是否已注册
    try {
      const userQuery = await db
        .collection("users")
        .where({ _openid: openid })
        .get();

      if (userQuery.data && userQuery.data.length > 0) {
        const user = userQuery.data[0];
        this.globalData.userInfo = user;
        this.globalData.isLoggedIn = true;
        this.globalData.hasGuided = true;
        wx.setStorageSync("userInfo", user);
      }
      // 若不存在用户记录 → hasGuided 保持 false，页面会跳转引导页
    } catch (dbErr) {
      // users 集合可能还未创建
      console.error("查询 users 集合失败：", dbErr);
    }
  },

  /**
   * 保存用户信息到 globalData 和本地缓存
   * @param {Object} userInfo - 用户信息对象（来自 users 集合的字段）
   */
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    this.globalData.hasGuided = true;
    wx.setStorageSync("userInfo", userInfo);
  },

  /**
   * 清除登录态（退出登录时调用）
   */
  clearLoginState() {
    this.globalData.openid = "";
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    this.globalData.hasGuided = false;
    wx.removeStorageSync("openid");
    wx.removeStorageSync("userInfo");
  },
});
