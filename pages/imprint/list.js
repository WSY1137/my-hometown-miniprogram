// list.js
Page({
  data: {
    hotImprints: [],
    imprints: [],
    loading: true
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    // 每次页面显示时重新加载数据
    this.loadData();
  },

  // 加载数据
  loadData: function() {
    this.setData({ loading: true });

    Promise.all([
      this.getHotImprints(),
      this.getAllImprints()
    ]).then(() => {
      this.setData({ loading: false });
    }).catch(err => {
      console.error('加载数据失败', err);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    });
  },

  // 获取热门印记
  getHotImprints: function() {
    return wx.cloud.callFunction({
      name: 'getHotImprints',
      success: res => {
        // 格式化时间
        const hotImprints = res.result.data.map(item => {
          return {
            ...item,
            createTimeFormat: this.formatTime(item.createTime)
          };
        });
        this.setData({ hotImprints });
      },
      fail: err => {
        console.error('获取热门印记失败', err);
        throw err;
      }
    });
  },

  // 获取所有印记
  getAllImprints: function() {
    const db = wx.cloud.database();
    return db.collection('hometown_imprints')
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
      .then(res => {
        // 格式化时间
        const imprints = res.data.map(item => {
          return {
            ...item,
            createTimeFormat: this.formatTime(item.createTime)
          };
        });
        this.setData({ imprints });
      })
      .catch(err => {
        console.error('获取所有印记失败', err);
        throw err;
      });
  },

  // 格式化时间
  formatTime: function(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    // 计算时间差
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < month) {
      return Math.floor(diff / day) + '天前';
    } else {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
  },

  // 跳转到发布页面
  navigateToPublish: function() {
    console.log('发布按钮被点击');
    try {
      // 使用完整的页面路径
      wx.navigateTo({
        url: '/pages/imprint/publish',
        success: function(res) {
          console.log('跳转到发布页面成功', res);
        },
        fail: function(err) {
          console.error('跳转到发布页面失败', err);
          wx.showToast({
            title: '跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none',
            duration: 3000
          });
        }
      });
    } catch (e) {
      console.error('跳转时发生异常', e);
      wx.showToast({
        title: '发生异常: ' + e.message,
        icon: 'none',
        duration: 3000
      });
    }
  },
  
  // 测试发布按钮
  testPublish: function() {
    console.log('测试发布按钮被点击');
    try {
      wx.navigateTo({
        url: '/pages/imprint/publish',
        success: function(res) {
          console.log('测试跳转到发布页面成功', res);
        },
        fail: function(err) {
          console.error('测试跳转到发布页面失败', err);
          wx.showToast({
            title: '测试跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none',
            duration: 3000
          });
        }
      });
    } catch (e) {
      console.error('测试跳转时发生异常', e);
      wx.showToast({
        title: '测试异常: ' + e.message,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 跳转到详情页
  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/imprint/detail?id=${id}`
    });
  }
});