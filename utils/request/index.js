import RequestUtil from './requestUtil.js'
import {
	useUserStore
} from '@/store/modules/user';
import {
	useAppStore
} from '@/store/modules/app'

let service = new RequestUtil()

/**
 * 自定义验证器，
 * 如果返回true 则进入响应拦截器的响应成功函数(resolve)，
 * 否则进入响应拦截器的响应错误函数(reject)
 * @param { Number } statusCode - 请求响应体statusCode（只读）
 * @return { Boolean } 如果为true,则 resolve, 否则 reject
 */
service.validateStatus = (statusCode) => {
	return statusCode === 200
}

/**
 * 请求拦截器
 */
service.interceptor.request((config, cancel) => {
	const userStore = useUserStore();
	const appStore = useAppStore();
	/* 请求之前拦截器 */
	if (!config.noToken) {
		if (userStore.getToken) {
			config.header['Authorization'] = `Bearer ${userStore.getToken}`
		}
		// else {
		// 	// 调用cancel 会取消本次请求，但是该函数的catch() 仍会执行
		// 	// 接收一个参数，会传给catch((err) => {}) err.errMsg === 'token 不存在'
		// 	cancel('token 不存在')
		// }
	}

	console.log('request config', config);
	console.log('pages', getCurrentPages());
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	if (config.url.indexOf('/v2/login_manage/') === -1) {
		console.log('config.url', config.url);
		config.params = {
			...config.params,
			menu_url: currentPage.route
		}
	}


	if (config.method === 'GET') {
		config.header['content-type'] = ''
	} else if (config.method === 'POST') {
		config.header['content-type'] = 'application/x-www-form-urlencoded'
	} else {
		config.header['content-type'] = 'application/json'
	}

	if (config.method === 'DELETE') {
		config.data = undefined;
	} else {
		config.data = {
			...config.data,
			server_flag: '2002'
		}
	}

	if (appStore.getApiServer) {
		config.baseUrl = appStore.getApiServer;
	}

	return config
})

/**
 * 应答拦截器
 */
service.interceptor.response(async (response) => {
	console.log('response interceptor', response);
	const userStore = useUserStore();
	if (response.data.code === 200) {
		return response.data.data;
	}

	let dataErrMsg = response.data.msg?.detail || response.data.msg || '服务开小差了'
	// 401: token not valid 
	// 407:登录信息过期后自动跳转至登录页
	// 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
	if ([40001, 401, 407, 50008, 50012, 50014].indexOf(response.data.code) > -1) {
		if ([401].indexOf(response.data.code) > -1) {
			dataErrMsg = '用户名或密码错误';
		} else if ([407, 50014].indexOf(response.data.code) > -1) {
			dataErrMsg = '用户密钥已过期，请重新登录';
		} else if ([40001].indexOf(response.data.code) > -1) {
			dataErrMsg = '当前微信用户未注册，请先登录';
		}

		uni.showToast({
			icon: 'none',
			title: dataErrMsg,
			duration: 1000,
			success: () => {
				setTimeout(async () => {
					if (response.config.url !== '/v2/api-token-auth/') {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}
					return;
				}, 1000);
			}
		});

	} else {
		uni.showToast({
			icon: 'none',
			title: dataErrMsg,
			duration: 1000
		});
		return Promise.reject(new Error(dataErrMsg));
	}

}, (error) => {
	console.log('response interceptor error', error);
	let errMsg =
		error.message ||
		(error.response && error.response.data.msg) ||
		'网络开小差了...';
	if (errMsg.indexOf('timeout') > -1) {
		errMsg = '请求超时，请稍侯再试...';
	}

	uni.showToast({
		icon: 'none',
		title: errMsg,
		duration: 1000
	});
	return Promise.reject(error);
})

const get = (url, data = {}, options = {}) => {
	if (data) {
		for (const prop in data) {
			if (data[prop] === '' || data[prop] === undefined || data[prop] === null) {
				continue
			}

			let connector = url.indexOf('?') > -1 ? '&' : '?';
			let paramStr = connector + encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
			url += paramStr;
		}
	}


	return service.request({
		url,
		method: 'GET',
		...options
	})
}

const post = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'POST',
		...options
	})
}

const patch = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'PATCH',
		...options
	})
}

// #ifndef MP-ALIPAY
const put = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'PUT',
		...options
	})
}
// #endif

// #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
const remove = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'DELETE',
		...options
	})
}
// #endif

// #ifdef APP-PLUS || H5 || MP-WEIXIN
const connect = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'CONNECT',
		...options
	})
}
// #endif

// #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
const head = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'HEAD',
		...options
	})
}
// #endif

// #ifdef APP-PLUS || H5 || MP-WEIXIN || MP-BAIDU
const options = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'OPTIONS',
		...options
	})
}
// #endif

// #ifdef APP-PLUS || H5 || MP-WEIXIN
const trace = (url, data, options = {}) => {
	return service.request({
		url,
		data,
		method: 'TRACE',
		...options
	})
}
// #endif

const upload = (url, {
	// #ifdef APP-PLUS
	files,
	// #endif
	// #ifdef MP-ALIPAY
	fileType,
	// #endif
	filePath,
	name,
	header,
	formData = {},
	custom = {},
	params = {},
	getTask
}) => {
	return new Promise((resolve, reject) => {
		let next = true
		const globalHeader = {
			...service.config.header
		}
		delete globalHeader['content-type']
		delete globalHeader['Content-Type']
		const pubConfig = {
			baseUrl: service.config.baseUrl,
			url,
			// #ifdef MP-ALIPAY
			fileType,
			// #endif
			filePath,
			method: 'UPLOAD',
			name,
			header: header || globalHeader,
			formData,
			params,
			custom: {
				...service.config.custom,
				...custom
			},
			getTask: getTask || service.config.getTask
		}
		// #ifdef APP-PLUS
		if (files) {
			pubConfig.files = files
		}
		// #endif
		const cancel = (t = 'handle cancel', config = pubConfig) => {
			const err = {
				errMsg: t,
				config: config
			}
			reject(err)
			next = false
		}

		const handleRe = {
			...service.requestBeforeFun(pubConfig, cancel)
		}
		const _config = {
			url: RequestUtil.mergeUrl(handleRe.url, handleRe.baseUrl, handleRe.params),
			// #ifdef MP-ALIPAY
			fileType: handleRe.fileType,
			// #endif
			filePath: handleRe.filePath,
			name: handleRe.name,
			header: handleRe.header,
			formData: handleRe.formData,
			complete: (response) => {
				response.config = handleRe
				if (typeof response.data === 'string') {
					response.data = JSON.parse(response.data)
				}
				if (service.validateStatus(response.statusCode)) { // 成功
					response = service.requestComFun(response)
					resolve(response)
				} else {
					response = service.requestComFail(response)
					reject(response)
				}
			}
		}
		// #ifdef APP-PLUS
		if (handleRe.files) {
			_config.files = handleRe.files
		}
		// #endif
		if (!next) return
		const requestTask = uni.uploadFile(_config)
		if (handleRe.getTask) {
			handleRe.getTask(requestTask, handleRe)
		}
	})
}

const download = (url, options = {}) => {
	return new Promise((resolve, reject) => {
		let next = true
		const pubConfig = {
			baseUrl: service.config.baseUrl,
			url,
			method: 'DOWNLOAD',
			header: options.header || service.config.header,
			params: options.params || {},
			custom: {
				...service.config.custom,
				...(options.custom || {})
			},
			getTask: options.getTask || service.config.getTask
		}
		const cancel = (t = 'handle cancel', config = pubConfig) => {
			const err = {
				errMsg: t,
				config: config
			}
			reject(err)
			next = false
		}

		const handleRe = {
			...service.requestBeforeFun(pubConfig, cancel)
		}
		if (!next) return
		const requestTask = uni.downloadFile({
			url: RequestUtil.mergeUrl(handleRe.url, handleRe.baseUrl, handleRe.params),
			header: handleRe.header,
			complete: (response) => {
				response.config = handleRe
				if (service.validateStatus(response.statusCode)) { // 成功
					response = service.requestComFun(response)
					resolve(response)
				} else {
					response = service.requestComFail(response)
					reject(response)
				}
			}
		})
		if (handleRe.getTask) {
			handleRe.getTask(requestTask, handleRe)
		}
	})
}


export default {
	get,
	post,
	patch,
	put,
	remove,
	connect,
	head,
	options,
	trace,
	upload,
	download
}