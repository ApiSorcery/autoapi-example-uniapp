import request from '@/utils/request/index.js';

/**
 * 获取所有用户（分页）
 */
export const getUserPaged = async function(data) {
  return await request.post(
    `/user/paged`, data
  );
}

/**
 * 获取单个用户
 */
export const getUserOne = async function(id) {
	return await request.get(
		`/user/${id}/`
	);
}