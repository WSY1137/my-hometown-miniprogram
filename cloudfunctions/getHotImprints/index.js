// getHotImprints/index.js
// 云函数：获取热门印记（按点赞数Top5）
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init();

// 获取数据库实例
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 查询点赞数Top5的印记
    const result = await db.collection('hometown_imprints')
      .orderBy('likeCount', 'desc') // 按点赞数倒序排列
      .limit(5) // 限制返回前5条
      .get();

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('获取热门印记失败', error);
    return {
      success: false,
      error: error.message
    };
  }
};