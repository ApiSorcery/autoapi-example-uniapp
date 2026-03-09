import type { AxiosResponse } from 'axios'
import type { Result } from '../types/axios'

export default {
  onFulfilled: async (res : AxiosResponse<Result>) => {
    console.log('响应数据：', res)
    if (res.data.status === 0) {
      return res.data.data
    }

    // Return blob format for file download
    if (res.config.responseType === 'blob') {
      return res.data;
    }

    let dataErrMsg = res.data.message || 'Request failed, please try again later...'
    return Promise.reject(new Error(dataErrMsg))
  },
  onRejected: async (error : any) => {
    let errMsg =
      error.message || (error.response && error.response.data.message) || 'Network error...'
    if (errMsg.indexOf('timeout') > -1) {
      errMsg = 'Request timeout, please try again later...'
    }
    return Promise.reject(error)
  },
}