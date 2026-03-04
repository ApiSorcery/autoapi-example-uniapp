import request from '@/utils/request/index.js';

/**
 * Add user
 */
export const addUser = async function(data) {
  return await request.post(
    `/user`, data
  );
}

/**
 * Get single user
 */
export const getUserOne = async function(id) {
	return await request.get(
		`/user/${id}/`
	);
}

/**
 * Query user list with pagination
 */
export const getUserPaged = async function(data) {
  return await request.post(
    `/user/paged`, data
  );
}

/**
 * Modify user information
 */
export const modifyUser = async function(data) {
  return await request.patch(
    `/user`, data
  );
}