// getUserOpenid/index.js
// 云函数：获取用户openid
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init();

exports.main = async (event, context) => {
  try {
    // 获取当前用户的openid
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    return {
      success: true,
      openid: openid
    };
  } catch (error) {
    console.error('获取openid失败', error);
    return {
      success: false,
      error: error.message
    };
  }
};