/**
 * 火山引擎 OpenAPI 服务基类
 * 移植自 @volcengine/openapi
 */

import Signer from './sign';
import fetch from './fetch';
import { AxiosRequestConfig } from 'axios';
import qs from 'querystring';
import {
	OpenApiResponse,
	ServiceOptions,
	CreateAPIParams,
	FetchParams,
	ServiceOptionsBase,
} from './types';

const defaultOptions = {
	host: 'open.volcengineapi.com',
	region: 'cn-north-1',
	protocol: 'https:',
};

export default class Service {
	constructor(options: ServiceOptions) {
		this.options = {
			...defaultOptions,
			...options,
		};
	}

	private options: ServiceOptions;

	setAccessKeyId = (accessKeyId: string): void => {
		this.options.accessKeyId = accessKeyId;
	};

	setSecretKey = (secretKey: string): void => {
		this.options.secretKey = secretKey;
	};

	setSessionToken = (sessionToken: string): void => {
		this.options.sessionToken = sessionToken;
	};

	setRegion = (region: string): void => {
		this.options.region = region;
	};

	setHost = (host: string): void => {
		this.options.host = host;
	};

	getSessionToken = (): string | undefined => this.options.sessionToken;

	getAccessKeyId = (): string | undefined => this.options.accessKeyId;

	getSecretKey = (): string | undefined => this.options.secretKey;

	/**
	 * 创建 JSON API
	 * @param Action OpenAPI Action
	 * @param createParams.Version OpenAPI 版本，如果不提供，将使用服务的 defaultVersion
	 * @param createParams.method HTTP 方法，默认为 POST
	 * @param createParams.contentType Body 内容类型，默认为 json
	 */
	createJSONAPI<RequestData extends Record<string, unknown>, Result>(
		Action: string,
		createParams?: CreateAPIParams,
	) {
		return this.createAPI<RequestData, Result>(Action, {
			method: 'POST',
			contentType: 'json',
			...createParams,
		});
	}

	/**
	 * 创建 urlencode API
	 * @param Action OpenAPI Action
	 * @param createParams.Version OpenAPI 版本，如果不提供，将使用服务的 defaultVersion
	 * @param createParams.method HTTP 方法，默认为 POST
	 * @param createParams.contentType Body 内容类型，默认为 urlencode
	 */
	createUrlEncodeAPI<RequestData extends Record<string, unknown>, Result>(
		Action: string,
		createParams?: CreateAPIParams,
	) {
		return this.createAPI<RequestData, Result>(Action, {
			method: 'POST',
			contentType: 'urlencode',
			...createParams,
		});
	}

	/**
	 * 创建 API 函数
	 * @param Action OpenAPI Action
	 * @param createParams.Version OpenAPI 版本，如果不提供，将使用服务的 defaultVersion
	 * @param createParams.method HTTP 方法，如 GET POST PUT
	 * @param createParams.contentType Body 内容类型，支持: json urlencode
	 */
	createAPI<RequestData extends Record<string, unknown>, Result>(
		Action: string,
		createParams?: CreateAPIParams,
	) {
		const { Version, method = 'GET', contentType = 'urlencode', queryKeys = [] } = createParams || {};
		return (
			requestData: RequestData,
			params?: FetchParams & AxiosRequestConfig,
			options?: ServiceOptionsBase,
		) => {
			const requestParams: FetchParams & AxiosRequestConfig = {
				...params,
				method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
				Action,
				Version,
			};
			if (method === 'GET') {
				requestParams.query = requestData;
			} else {
				requestParams.query = {
					...queryKeys.reduce(
						(res, key) => {
							return requestData[key] !== undefined ? { ...res, [key]: requestData[key] } : res;
						},
						{} as Record<string, unknown>,
					),
					...(params?.query ?? {}),
				};
				switch (contentType) {
					case 'json': {
						requestParams.headers = {
							...requestParams.headers,
							'content-type': 'application/json; charset=utf-8',
						};
						requestParams.data = requestData;
						break;
					}
					case 'urlencode': {
						const body = new URLSearchParams();
						Object.keys(requestData)
							.filter((key) => {
								const val = requestData[key];
								return val !== null && val !== undefined;
							})
							.forEach((key) => {
								body.append(key, String(requestData[key]));
							});
						requestParams.data = body;
						break;
					}
					default: {
						throw new Error(`contentType ${contentType} is not support`);
					}
				}
			}
			return this.fetchOpenAPI<Result>(requestParams, options);
		};
	}

	fetchOpenAPI<Result>(
		params: FetchParams & AxiosRequestConfig,
		options?: ServiceOptionsBase,
	): Promise<OpenApiResponse<Result>> {
		const realOptions = {
			...this.options,
			...options,
		};
		const requestInit: Record<string, unknown> = {
			pathname: '/',
			...params,
			params: {
				...(params.query as Record<string, unknown>),
				Action: params.Action,
				Version: params.Version || realOptions.defaultVersion,
			},
			region: realOptions.region || defaultOptions.region,
			method: params.method || 'GET',
		};
		if (requestInit.data) {
			requestInit.body = requestInit.data;
		}
		// normalize query
		const requestParams = requestInit.params as Record<string, unknown>;
		for (const [key, val] of Object.entries(requestParams)) {
			if (val === undefined || val === null) {
				requestParams[key] = '';
			}
		}
		const signer = new Signer(
			requestInit as {
				region: string;
				method: string;
				params?: Record<string, unknown>;
				pathname?: string;
				headers?: Record<string, string>;
				body?: unknown;
			},
			realOptions.serviceName,
		);
		const { accessKeyId, secretKey, sessionToken } = realOptions;
		if (!accessKeyId || !secretKey) {
			throw new Error('accessKeyId and secretKey is necessary');
		}
		signer.addAuthorization({ accessKeyId, secretKey, sessionToken });
		let uri = `${realOptions.protocol || defaultOptions.protocol}//${
			realOptions.host || defaultOptions.host
		}${requestInit.pathname}`;
		const queryString = qs.stringify(requestParams as Record<string, string>);
		if (queryString) uri += '?' + queryString;
		return fetch(uri, {
			...requestInit,
			params: undefined,
		} as AxiosRequestConfig);
	}
}
