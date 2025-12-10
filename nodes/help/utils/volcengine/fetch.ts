/**
 * 火山引擎 OpenAPI HTTP 请求
 * 移植自 @volcengine/openapi
 */

import axios, { AxiosRequestConfig } from 'axios';
import { OpenApiResponse } from './types';

const ua = 'n8n-nodes-volcengine/v1.0.0';

export default async function request<Result>(
	url: string,
	reqInfo: AxiosRequestConfig,
): Promise<OpenApiResponse<Result>> {
	const { headers = {} } = reqInfo;
	const reqOption: AxiosRequestConfig = {
		url: url.trim(),
		timeout: 30000,
		...reqInfo,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			...headers,
			'User-Agent': ua,
		},
		validateStatus: null,
	};
	const res = await axios(reqOption);
	return res.data;
}
