import axios, {
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios';

export interface RequestConfig extends AxiosRequestConfig {}
export interface ResponsePromise<T> extends AxiosPromise<T> {}
export interface Response<T = any> extends AxiosResponse<T> {}

export class Request {
  constructor(private request: AxiosStatic = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): ResponsePromise<T> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestError(error: AxiosError): boolean {
    return !!(error.response && error.response.status);
  }
}
