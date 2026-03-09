export interface Result<T = any> {
  status: number
  data: T
  message: string
}

export interface BlobResp {
  data: string
  type: string
  name: string
}
