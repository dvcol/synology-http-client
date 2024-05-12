export enum HttpMethod {
  post = 'post',
  POST = 'POST',
  get = 'get',
  GET = 'GET',
  put = 'put',
  PUT = 'PUT',
  delete = 'delete',
  DELETE = 'DELETE',
}

/** Union of HTTP methods types */
export type HttpMethods = keyof typeof HttpMethod;
