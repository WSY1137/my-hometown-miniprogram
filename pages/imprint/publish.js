// publish.js
Page({
  data: {
    formData: {
      title: '',
      content: '',
      type: null,
      typeIndex: 0,
      images: [],
      authorOpenid: ''
    },
    typeList: [
      { id: 'scenic', name: '景点' },
      { id: 'food', name: '美食' },
      { id: 'story', name: '故事' }
    ],
    selectedTypeText: '未选择类型',
    loading: false,
    canSubmit: false
  },

  onLoad: function() {
    // 获取用户openid
    this.getUserOpenid();
    // 检查是否有草稿
    this.loadDraft();
    // 初始化表单验证
    this.checkFormValidity();
  },

  onUnload: function() {
    // 页面离开时保存草稿
    this.autoSaveDraft();
  },

  // 获取用户openid
  getUserOpenid: function() {
    wx.cloud.callFunction({
      name: 'getUserOpenid',
      success: res => {
        this.setData({
          'formData.authorOpenid': res.result.openid
        });
      },
      fail: err => {
        console.error('获取openid失败', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查表单是否可以提交
  checkFormValidity: function() {
    const { title, content, type, images } = this.data.formData;
    const isValid = 
      title.trim().length > 0 && title.length <= 20 &&
      content.trim().length >= 10 && content.length <= 500 && // 与textarea maxlength保持一致
      type !== null &&
      images.length >= 1 && images.length <= 9; // 修改为与UI提示一致的9张图片限制
    
    this.setData({ canSubmit: isValid });
  },

  // 类型选择变化
  typeChange: function(e) {
    const index = e.detail.value;
    const selectedType = this.data.typeList[index];
    this.setData({
      'formData.typeIndex': index,
      'formData.type': selectedType,
      selectedTypeText: selectedType.name
    });
    // 检查表单有效性
    this.checkFormValidity();
  },

  // 标题输入处理
  titleInput: function(e) {
    const value = e.detail.value;
    this.setData({
      'formData.title': value
    });
    // 检查表单有效性
    this.checkFormValidity();
    
    // 实时字数提醒
    if (value.length === 15) {
      wx.showToast({
        title: '标题即将达到字数上限',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 内容输入处理
  contentInput: function(e) {
    const value = e.detail.value;
    this.setData({
      'formData.content': value
    });
    // 检查表单有效性
    this.checkFormValidity();
    
    // 实时字数提醒
    if (value.length === 450) {
      wx.showToast({
        title: '内容即将达到字数上限',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 9 - this.data.formData.images.length, // 修改为与UI提示一致的9张图片限制
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          'formData.images': [...this.data.formData.images, ...tempFilePaths]
        });
        // 检查表单有效性
        this.checkFormValidity();
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.formData.images;
    images.splice(index, 1);
    this.setData({
      'formData.images': images
    });
    // 检查表单有效性
    this.checkFormValidity();
  },

  // 返回/取消按钮
  goBack: function() {
    // 如果表单有内容，询问是否确认离开
    const { title, content, images } = this.data.formData;
    if (title.trim() || content.trim() || images.length > 0) {
      wx.showModal({
        title: '提示',
        content: '您的内容尚未发布，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            // 使用redirectTo而不是navigateBack，确保能够直接返回列表页
            wx.redirectTo({
              url: '/pages/imprint/list'
            });
          }
        }
      });
    } else {
      // 直接返回列表页
      wx.redirectTo({
        url: '/pages/imprint/list'
      });
    }
  },

  // 保存草稿
  saveDraft: function() {
    const { title, content, type, images } = this.data.formData;
    
    // 检查是否有内容需要保存
    if (!title.trim() && !content.trim() && images.length === 0) {
      return wx.showToast({
        title: '没有需要保存的内容',
        icon: 'none'
      });
    }
    
    // 保存到本地存储
    const draft = {
      title,
      content,
      type,
      typeIndex: this.data.formData.typeIndex,
      saveTime: new Date().getTime()
    };
    
    // 只保存图片路径（临时路径）
    if (images.length > 0) {
      draft.imagePaths = images;
    }
    
    try {
      wx.setStorageSync('imprintDraft', draft);
      wx.showToast({
        title: '草稿保存成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('保存草稿失败', e);
      wx.showToast({
        title: '保存草稿失败',
        icon: 'none'
      });
    }
  },

  // 自动保存草稿
  autoSaveDraft: function() {
    const { title, content, images } = this.data.formData;
    
    // 只有有内容时才自动保存
    if (title.trim() || content.trim() || images.length > 0) {
      this.saveDraft();
    }
  },

  // 加载草稿
  loadDraft: function() {
    try {
      const draft = wx.getStorageSync('imprintDraft');
      if (draft) {
        // 计算草稿保存时间
        const now = new Date().getTime();
        const draftTime = draft.saveTime;
        const hoursAgo = Math.floor((now - draftTime) / (1000 * 60 * 60));
        
        wx.showModal({
          title: '发现草稿',
          content: `检测到${hoursAgo > 0 ? hoursAgo + '小时' : '刚刚'}保存的草稿，是否恢复？`,
          success: (res) => {
            if (res.confirm) {
              // 恢复草稿
              const typeIndex = draft.typeIndex || 0;
              const selectedType = draft.type || this.data.typeList[typeIndex];
              this.setData({
                'formData.title': draft.title || '',
                'formData.content': draft.content || '',
                'formData.type': selectedType,
                'formData.typeIndex': typeIndex,
                'formData.images': draft.imagePaths || [],
                selectedTypeText: selectedType ? selectedType.name : '未选择类型'
              });
              // 检查表单有效性
              this.checkFormValidity();
              // 清除草稿
              wx.removeStorageSync('imprintDraft');
            }
          }
        });
      }
    } catch (e) {
      console.error('加载草稿失败', e);
    }
  },

  // 表单提交
  submitForm: function() {
    const { title, content, type, images, authorOpenid } = this.data.formData;

    // 表单验证
    if (!title.trim()) {
      return wx.showToast({ title: '请输入标题', icon: 'none' });
    }
    if (title.length > 20) {
      return wx.showToast({ title: '标题不能超过20字', icon: 'none' });
    }
    if (!content.trim()) {
      return wx.showToast({ title: '请输入内容', icon: 'none' });
    }
    if (content.length < 10 || content.length > 500) {
      return wx.showToast({ title: '内容长度应在10-500字之间', icon: 'none' });
    }
    if (!type) {
      return wx.showToast({ title: '请选择类型', icon: 'none' });
    }
    if (images.length === 0) {
      return wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
    }

    this.setData({ loading: true });

    // 显示上传进度提示
    wx.showLoading({
      title: '正在发布...',
      mask: true
    });

    // 上传图片到云存储
    const uploadTasks = images.map((item, index) => {
      return wx.cloud.uploadFile({
        cloudPath: `imprints/${Date.now()}_${index}.${item.match(/\.([^.]+)$/)[1]}`,
        filePath: item
      });
    });

    Promise.all(uploadTasks)
      .then(res => {
        const cloudPaths = res.map(item => item.fileID);
        
        // 提交到云数据库
        return wx.cloud.database().collection('hometown_imprints').add({
          data: {
            title: title.trim(),
            content: content.trim(),
            type: type,
            images: cloudPaths,
            authorOpenid: authorOpenid,
            likeCount: 0,
            likeUsers: [],
            createTime: new Date(),
            updateTime: new Date()
          }
        });
      })
      .then(() => {
        // 清除草稿
        try {
          wx.removeStorageSync('imprintDraft');
        } catch (e) {
          console.error('清除草稿失败', e);
        }
        
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            // 跳转到列表页
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/imprint/list'
              });
            }, 2000);
          }
        });
      })
      .catch(err => {
        console.error('发布失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});