/**
 * 火山引擎 OpenAPI HTTP 请求
 * 使用 n8n-workflow 的请求方式
 */

import { OpenApiResponse, RequestInfo, HttpRequestFn } from './types';

const ua = 'n8n-nodes-volcengine/v1.0.0';

/**
 * 默认的 HTTP 请求函数（使用 fetch）
 * 在没有提供 n8n httpRequest 函数时使用
 */
export async function defaultHttpRequest<Result>(
	url: string,
	reqInfo: RequestInfo,
): Promise<OpenApiResponse<Result>> {
	const { headers = {}, method = 'GET', data } = reqInfo;

	const fetchOptions: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': ua,
			...headers,
		},
	};

	if (data && method !== 'GET') {
		if (typeof data === 'string') {
			fetchOptions.body = data;
		} else if (data instanceof URLSearchParams) {
			fetchOptions.body = data.toString();
		} else {
			fetchOptions.body = JSON.stringify(data);
			// 如果 body 是 JSON，设置正确的 Content-Type
			if (
				headers['Content-Type'] === undefined &&
				headers['content-type'] === undefined
			) {
				(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
			}
		}
	}

	const response = await fetch(url.trim(), fetchOptions);
	return (await response.json()) as OpenApiResponse<Result>;
}

/**
 * 创建请求函数
 * @param httpRequestFn 可选的 n8n httpRequest 函数
 */
export function createRequestFn(httpRequestFn?: HttpRequestFn): typeof defaultHttpRequest {
	if (httpRequestFn) {
		return async <Result>(url: string, reqInfo: RequestInfo): Promise<OpenApiResponse<Result>> => {
			const { headers = {}, method = 'GET', data } = reqInfo;

			let body: string | Record<string, unknown> | undefined;
			if (data && method !== 'GET') {
				if (typeof data === 'string') {
					body = data;
				} else if (data instanceof URLSearchParams) {
					body = data.toString();
				} else {
					body = data as Record<string, unknown>;
				}
			}

			const response = await httpRequestFn({
				method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
				url: url.trim(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': ua,
					...headers,
				},
				body,
				json: true,
				returnFullResponse: false,
				skipSslCertificateValidation: false,
			});

			return response as OpenApiResponse<Result>;
		};
	}

	return defaultHttpRequest;
}

export default defaultHttpRequest;
