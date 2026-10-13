// test.js
Page({
  data: {
    title: '测试页面'
  },

  onLoad: function() {
    console.log('测试页面加载');
  },

  // 测试跳转到发布页面
  testNavigateToPublish: function() {
    console.log('测试跳转到发布页面');
    try {
      wx.navigateTo({
        url: '/pages/imprint/publish',
        success: function(res) {
          console.log('跳转成功', res);
          wx.showToast({
            title: '跳转成功',
            icon: 'success'
          });
        },
        fail: function(err) {
          console.error('跳转失败', err);
          wx.showToast({
            title: '跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none',
            duration: 3000
          });
        }
      });
    } catch (e) {
      console.error('跳转异常', e);
      wx.showToast({
        title: '发生异常: ' + e.message,
        icon: 'none',
        duration: 3000
      });
    }
  }
});