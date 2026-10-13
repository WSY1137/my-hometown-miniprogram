// likeImprint/index.js
// 云函数：点赞功能，包括防重复点赞逻辑
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init();

// 获取数据库实例
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    // 获取当前用户的openid
    const wxContext = cloud.getWXContext();
    const currentOpenid = wxContext.OPENID;
    
    // 获取要点赞的印记ID
    const { imprintId } = event;
    
    if (!imprintId) {
      return {
        success: false,
        error: '缺少印记ID'
      };
    }
    
    // 检查印记是否存在
    const imprint = await db.collection('hometown_imprints').doc(imprintId).get();
    
    // 检查用户是否已经点赞
    const likeUsers = imprint.data.likeUsers || [];
    if (likeUsers.includes(currentOpenid)) {
      return {
        success: false,
        error: '已经点过赞了'
      };
    }
    
    // 更新点赞信息
    await db.collection('hometown_imprints').doc(imprintId).update({
      data: {
        likeCount: _.inc(1), // 点赞数+1
        likeUsers: _.push(currentOpenid), // 将当前用户openid添加到点赞用户数组
        updateTime: new Date() // 更新时间
      }
    });
    
    return {
      success: true,
      message: '点赞成功'
    };
  } catch (error) {
    console.error('点赞失败', error);
    return {
      success: false,
      error: error.message
    };
  }
};