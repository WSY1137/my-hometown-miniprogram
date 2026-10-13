// app.js
App({
  onLaunch: function() {
    // 初始化云环境
    wx.cloud.init({
      env: 'cloudbase-6gfak1xv16fe4d07', // 使用默认环境，避免硬编码环境ID
      traceUser: true
    })
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})
