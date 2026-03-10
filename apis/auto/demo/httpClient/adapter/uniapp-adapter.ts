import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosProgressEvent, InternalAxiosRequestConfig } from 'axios'

// 扩展原始配置接口
declare module 'axios' {
  export interface AxiosRequestConfig {
    filePath ?: string;
    /** 文件名 */
    name ?: string;
    formData ?: any;
  }
}

export default function uniappAdapter(
  config : InternalAxiosRequestConfig
) : Promise<any> {
  return new Promise((resolve, reject) => {
    const headers : Record<string, string> = {}
    if (config.headers) {
      if (config.headers instanceof AxiosHeaders) {
        for (const [key, value] of Object.entries(config.headers.toJSON())) {
          if (value != null) {
            headers[key] = String(value)
          }
        }
      } else {
        for (const [key, value] of Object.entries(config.headers)) {
          if (value != null) {
            headers[key] = String(value)
          }
        }
      }
    }

    // 修改 URL 处理逻辑
    const isFullUrl = config.url?.startsWith('http://') || config.url?.startsWith('https://')
    const fullUrl = isFullUrl
      ? config.url
      : config.baseURL
        ? `${config.baseURL}${config.url}`
        : config.url

    // 通用响应处理
    const handleSuccess = (result : any) => {
      const response = {
        data: result.data,
        statusCode: result.statusCode || 200,
        header: result.header || {},
        cookies: result.cookies || [],
        tempFilePath: result.tempFilePath,
        tempFiles: result.tempFiles
      }

      if (
        typeof config.validateStatus === 'function' &&
        !config.validateStatus(response.statusCode)
      ) {
        const error = new AxiosError(
          `Request failed with status code ${response.statusCode}`,
          'ERR_BAD_RESPONSE',
          config,
          null,
          {
            status: response.statusCode,
            data: response.data,
            headers: response.header,
            config
          } as any
        )
        reject(error)
        return
      }

      resolve({
        data: response.tempFilePath || response.tempFiles || response.data,
        status: response.statusCode,
        statusText: '',
        headers: response.header,
        config,
        cookies: response.cookies,
        request: null
      })
    }
    // 通用错误处理
    const handleError = (result : any) => {
      reject(
        new AxiosError(
          result.errMsg || 'Request failed',
          result.errno || 'ERR_NETWORK',
          config,
          null,
          result
        )
      )
    }
    // 处理进度回调
    const handleProgress = (res : {
      progress : number
      totalBytesSent ?: number
      totalBytesExpectedToSend ?: number
      totalBytesWritten ?: number
      totalBytesExpectedToWrite ?: number
    }) => {
      // 将 uniapp 的参数包装成 Axios 预期的格式
      var progressEvent : AxiosProgressEvent = {
        loaded: res.totalBytesSent,
        total: res.totalBytesExpectedToSend,
        progress: res.progress / 100, // Axios 习惯用 0-1 之间的小数
        bytes: res.totalBytesSent,
        estimated: 0,
        rate: 0,
        upload: true
      }
      if (upperMethod === 'DOWNLOAD') {
        config.onDownloadProgress!(progressEvent);
      } else {
        config.onUploadProgress!(progressEvent);
      }
    }
    const upperMethod = config.method.toUpperCase()

    // 处理上传请求
    if (upperMethod === 'UPLOAD') {
      if (!config.data) {
        reject(new Error('Upload method requires data'))
        return
      }

      // 移除 content-type，让浏览器自动设置正确的 multipart/form-data
      if (headers['content-type']) {
        delete headers['content-type']
      }
      if (headers['Content-Type']) {
        delete headers['Content-Type']
      }

      let uploadConfig : UniNamespace.UploadFileOption = {
        url: fullUrl!,
        header: headers,
        timeout: config.timeout,
        success: handleSuccess as any,
        fail: handleError as any
      }

      try {
        // 尝试解析数据
        let uploadData = config.data
        if (typeof config.data === 'string' && config.data.startsWith('{')) {
          try {
            uploadData = JSON.parse(config.data)
          } catch (error : unknown) {
            // 如果解析失败，保持原始字符串
            uploadData = config.data
          }
        }

        // 处理两种上传方式
        if (typeof uploadData === 'string') {
          // 第一种方式：直接传递文件路径
          uploadConfig = {
            ...uploadConfig,
            filePath: uploadData,
            name: config.name || 'file',
            formData: config.formData
          }
        } else if (typeof uploadData === 'object' && 'filePath' in uploadData) {
          // 第二种方式：传递对象配置
          uploadConfig = {
            ...uploadConfig,
            filePath: uploadData.filePath,
            name: uploadData.name || 'file',
            formData: uploadData.formData
          }
        } else {
          reject(new Error('Invalid upload data format'))
          return
        }

        // 验证必要的参数
        if (!uploadConfig.filePath) {
          reject(new Error('Upload filePath is required'))
          return
        }

        const uploadTask = uni.uploadFile(uploadConfig)
        if (config.onUploadProgress && uploadTask && !('then' in uploadTask)) {
          ; (uploadTask as any).onProgressUpdate?.(handleProgress)
        }
      } catch (error : unknown) {
        if (error instanceof Error) {
          reject(new Error(`Failed to process upload data: ${error.message}`))
        } else {
          reject(new Error('Failed to process upload data'))
        }
      }

      return
    }

    // 处理下载请求
    if (upperMethod === 'DOWNLOAD') {
      const downloadTask = uni.downloadFile({
        url: fullUrl!,
        header: headers,
        timeout: config.timeout,
        filePath: config.filePath,
        success: handleSuccess as any,
        fail: handleError as any
      })

      if (config.onDownloadProgress && downloadTask && !('then' in downloadTask)) {
        ; (downloadTask as any).onProgressUpdate?.(handleProgress)
      }

      return
    }

    // 常规请求配置
    const requestConfig : UniNamespace.RequestOptions = {
      url: fullUrl!,
      method: upperMethod as any,
      header: headers,
      timeout: config.timeout,
      withCredentials: config.withCredentials,
      // #ifndef MP-ALIPAY || APP-PLUS
      responseType: config.responseType as 'text' | 'arraybuffer',
      // #endif
      dataType: config.responseType === 'json' ? 'json' : 'text',
      success: handleSuccess as any,
      fail: handleError as any
    }

    // 处理请求数据
    if (config.data || config.params) {
      if (upperMethod === 'GET') {
        // 合并 data 和 params
        const queryParams : Record<string, string> = {}

        // 处理 params
        if (config.params) {
          Object.entries(config.params).forEach(([key, value]) => {
            if (value != null) {
              queryParams[key] = String(value)
            }
          })
        }

        // 处理 data
        if (config.data) {
          Object.entries(config.data).forEach(([key, value]) => {
            if (value != null) {
              queryParams[key] = String(value)
            }
          })
        }

        // 构建查询字符串
        const queryString = Object.entries(queryParams)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join('&')

        if (queryString) {
          requestConfig.url +=
            (requestConfig.url.includes('?') ? '&' : '?') + queryString
        }
      } else {
        requestConfig.data =
          typeof config.data === 'object' ? JSON.stringify(config.data) : config.data
      }
    }

    // 发起请求
    uni.request(requestConfig)
  })
}