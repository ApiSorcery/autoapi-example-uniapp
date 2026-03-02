import request from '@/utils/request/index.js';

/**
 * 获取所有部门
 */
export const getUserPaged = async function(data) {
  return await request.post(
    `/user/paged`, data
  );
}