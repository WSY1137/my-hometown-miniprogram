// deleteImprint/index.js
// 云函数：删除印记功能，包括权限控制
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init();

// 获取数据库实例
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 获取当前用户的openid
    const wxContext = cloud.getWXContext();
    const currentOpenid = wxContext.OPENID;
    
    // 获取要删除的印记ID
    const { imprintId } = event;
    
    if (!imprintId) {
      return {
        success: false,
        error: '缺少印记ID'
      };
    }
    
    // 检查印记是否存在
    const imprint = await db.collection('hometown_imprints').doc(imprintId).get();
    
    // 检查权限（只有作者可以删除）
    if (imprint.data.authorOpenid !== currentOpenid) {
      return {
        success: false,
        error: '没有删除权限，只有作者可以删除'
      };
    }
    
    // 删除印记
    await db.collection('hometown_imprints').doc(imprintId).remove();
    
    return {
      success: true,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除失败', error);
    return {
      success: false,
      error: error.message
    };
  }
};