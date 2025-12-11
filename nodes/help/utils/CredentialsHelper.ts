/**
 * 火山引擎凭证工具函数
 * 提供统一的凭证获取和服务创建逻辑
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { IamService, AirService, Service, HttpRequestFn } from './volcengine';

/**
 * 火山引擎凭证信息
 */
export interface VolcEngineCredentials {
	accessKeyId: string;
	secretKey: string;
	region: string;
	host: string;
	baseUrl: string;
}

/**
 * 获取并解析火山引擎凭证
 * @param context n8n 执行上下文
 * @param index 当前处理的数据项索引
 * @returns 解析后的凭证信息
 */
export async function getVolcEngineCredentials(
	context: IExecuteFunctions,
	index: number,
): Promise<VolcEngineCredentials> {
	const credentials = await context.getCredentials('volcEngineApi', index);
	const baseUrl = (credentials.baseUrl as string) || 'https://open.volcengineapi.com';
	const accessKeyId = credentials.accessKeyId as string;
	const secretKey = credentials.secretKey as string;
	const region = credentials.region as string;

	// 从 baseUrl 提取 host
	const urlObj = new URL(baseUrl);
	const host = urlObj.host;

	return {
		accessKeyId,
		secretKey,
		region,
		host,
		baseUrl,
	};
}

/**
 * 创建 IamService 实例
 * @param credentials 凭证信息
 * @param httpRequestFn n8n HTTP 请求函数
 * @returns IamService 实例
 */
export function createIamService(
	credentials: VolcEngineCredentials,
	httpRequestFn: HttpRequestFn,
): IamService {
	return new IamService({
		accessKeyId: credentials.accessKeyId,
		secretKey: credentials.secretKey,
		host: credentials.host,
		region: credentials.region,
		httpRequestFn,
	});
}

/**
 * 创建 AirService 实例
 * @param credentials 凭证信息
 * @param httpRequestFn n8n HTTP 请求函数
 * @returns AirService 实例
 */
export function createAirService(
	credentials: VolcEngineCredentials,
	httpRequestFn: HttpRequestFn,
): AirService {
	return new AirService({
		accessKeyId: credentials.accessKeyId,
		secretKey: credentials.secretKey,
		region: credentials.region,
		httpRequestFn,
	});
}

/**
 * 创建通用 Service 实例
 * @param serviceName 服务名称
 * @param credentials 凭证信息
 * @param httpRequestFn n8n HTTP 请求函数
 * @returns Service 实例
 */
export function createService(
	serviceName: string,
	credentials: VolcEngineCredentials,
	httpRequestFn: HttpRequestFn,
): Service {
	return new Service({
		serviceName,
		accessKeyId: credentials.accessKeyId,
		secretKey: credentials.secretKey,
		host: credentials.host,
		region: credentials.region,
		httpRequestFn,
	});
}

