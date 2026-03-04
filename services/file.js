import request from '@/utils/request/index.js';

/**
 * 文件上传
 */
export const uploadFile = async function(data) {
  return await request.upload(
    `/file/upload`, data
  );
}
