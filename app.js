// app.js
App({
  onLaunch: function() {
    // 初始化云环境
    wx.cloud.init({
      traceUser: true
    })
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})
