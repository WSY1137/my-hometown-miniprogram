// index.js
Page({
  data:{
    poster: '/image/music.png',
    name: '香格里拉',
    author: 'RICHNOMADIC',
    src: '/audio/RICHNOMADIC - 香格里拉(Pord. beatsbyroki).mp3',
    currentTime: 0,
    duration: 0,
    progress: 0,
    isPlaying: false,
    currentTimeFormat: '0:00',
    durationFormat: '0:00'
  },
  audioPlay: function (options) {
    this.audioCtx.play()
    this.setData({ isPlaying: true })
  }, 
  audioPause: function (options) {
    this.audioCtx.pause()
    this.setData({ isPlaying: false })
  },
  audioSeek0: function (options) {
    this.audioCtx.seek(0)
  },
  // 更新进度条
  updateProgress: function(e) {
    const currentTime = e.detail.currentTime
    const duration = e.detail.duration
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    
    this.setData({
      currentTime: currentTime,
      duration: duration,
      progress: progress,
      currentTimeFormat: this.formatTime(currentTime),
      durationFormat: this.formatTime(duration)
    })
  },
  // 进度条拖动
  onSliderChange: function(e) {
    const value = e.detail.value
    const seekTime = (value / 100) * this.data.duration
    this.audioCtx.seek(seekTime)
  },
  // 格式化时间为 mm:ss
  formatTime: function(time) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  },
  onLoad: function (options) {
    this.setData({
      videoContext: wx.createVideoContext('myVideo')
    });
  },
  
  // 播放视频
  playVideo: function() {
    this.data.videoContext.play()
    wx.showToast({
      title: '开始播放',
      icon: 'success'
    })
  },
  
  // 暂停视频
  pauseVideo: function() {
    this.data.videoContext.pause()
    wx.showToast({
      title: '已暂停',
      icon: 'none'
    })
  },
  
  // 重新播放视频
  replayVideo: function() {
    this.data.videoContext.seek(0)
    this.data.videoContext.play()
    wx.showToast({
      title: '重新播放',
      icon: 'success'
    })
  },
  
  // 视频播放错误回调
  videoErrorCallback: function(e) {
    console.log('视频错误信息:', e.detail.errMsg)
    wx.showModal({
      title: '播放错误',
      content: '视频加载失败，请检查网络连接或视频地址',
      showCancel: false
    })
  },
  
  // 跳转到家乡印记列表页
  navigateToImprint: function() {
    wx.navigateTo({
      url: '/pages/imprint/list'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.audioCtx = wx.createAudioContext('myAudio')
    //this.audioCtx.play()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})

