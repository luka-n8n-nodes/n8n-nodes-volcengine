/**
 * 火山引擎 OpenAPI HTTP 请求
 * 使用 n8n-workflow 的请求方式
 */

import { OpenApiResponse, RequestInfo, HttpRequestFn } from './types';

const ua = 'n8n-nodes-volcengine/v1.0.0';

/**
 * 创建请求函数
 * @param httpRequestFn n8n httpRequest 函数
 */
export function createRequestFn(httpRequestFn: HttpRequestFn) {
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
		ignoreHttpStatusErrors: true,
	});
	return response as OpenApiResponse<Result>;
	};
}
