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

  public static isRequestError(error: Error): boolean {
    return !!(
      (error as AxiosError).response && (error as AxiosError).response?.status
    );
  }

  public static extractErrorData(
    error: unknown
  ): Pick<AxiosResponse, 'data' | 'status'> {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status) {
      return {
        data: axiosError.response.data,
        status: axiosError.response.status,
      };
    }
    throw Error(`The error ${error} is not a Request Error`);
  }
}
