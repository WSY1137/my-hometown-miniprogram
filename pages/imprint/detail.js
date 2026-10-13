// detail.js
Page({
  data: {
    imprint: null,
    loading: true,
    canDelete: false,
    isLiked: false,
    currentUserOpenid: ''
  },

  onLoad: function(options) {
    this.imprintId = options.id;
    this.getUserOpenid();
    this.loadImprintDetail();
  },

  // 获取用户openid
  getUserOpenid: function() {
    wx.cloud.callFunction({
      name: 'getUserOpenid',
      success: res => {
        this.setData({
          currentUserOpenid: res.result.openid
        });
        // 更新点赞状态与删除权限
        this.refreshLikeStatus();
        this.checkDeletePermission();
      },
      fail: err => {
        console.error('获取openid失败', err);
      }
    });
  },

  // 加载印记详情
  loadImprintDetail: function() {
    this.setData({ loading: true });

    const db = wx.cloud.database();
    db.collection('hometown_imprints').doc(this.imprintId).get()
      .then(res => {
        const imprint = res.data;
        
        // 格式化时间
        imprint.createTimeFormat = this.formatTime(imprint.createTime);
        
        this.setData({ imprint });
        
        // 更新点赞状态与删除权限
        this.refreshLikeStatus();
        this.checkDeletePermission();
      })
      .catch(err => {
        console.error('加载印记详情失败', err);
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
        // 如果加载失败，返回列表页
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 检查删除权限
  checkDeletePermission: function() {
    if (this.data.imprint && this.data.currentUserOpenid) {
      const canDelete = this.data.imprint.authorOpenid === this.data.currentUserOpenid;
      this.setData({ canDelete });
    }
  },

  // 更新点赞状态
  refreshLikeStatus: function() {
    const imprint = this.data.imprint;
    if (imprint && this.data.currentUserOpenid) {
      const isLiked = imprint.likeUsers && imprint.likeUsers.includes(this.data.currentUserOpenid);
      this.setData({ isLiked });
    }
  },

  // 格式化时间
  formatTime: function(time) {
    const date = new Date(time);
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0');
  },

  // 点赞功能
  likeImprint: function() {
    if (this.data.isLiked) {
      wx.showToast({
        title: '已点赞，不能重复点赞',
        icon: 'none'
      });
      return;
    }

    wx.cloud.callFunction({
      name: 'likeImprint',
      data: {
        imprintId: this.imprintId
      },
      success: res => {
        if (!res.result || !res.result.success) {
          wx.showToast({
            title: (res.result && res.result.error) || '点赞失败，请重试',
            icon: 'none'
          });
          return;
        }
        this.setData({
          'imprint.likeCount': this.data.imprint.likeCount + 1,
          isLiked: true
        });
        wx.showToast({
          title: '点赞成功',
          icon: 'success'
        });
      },
      fail: err => {
        console.error('点赞失败', err);
        wx.showToast({
          title: '点赞失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 确认删除
  confirmDelete: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个印记吗？删除后不可恢复。',
      success: res => {
        if (res.confirm) {
          this.deleteImprint();
        }
      }
    });
  },

  // 删除印记
  deleteImprint: function() {
    wx.cloud.callFunction({
      name: 'deleteImprint',
      data: {
        imprintId: this.imprintId
      },
      success: res => {
        if (!res.result || !res.result.success) {
          wx.showToast({
            title: (res.result && res.result.error) || '删除失败，请重试',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            // 返回列表页
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          }
        });
      },
      fail: err => {
        console.error('删除失败', err);
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
});