import { NodeApiError, JsonObject } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';

/**
 * 火山引擎 API 响应元数据
 */
interface VolcEngineResponseMetadata {
	RequestId: string;
	Action: string;
	Version: string;
	Service: string;
	Region: string;
	Error?: {
		Code: string;
		Message: string;
	};
}

/**
 * 火山引擎 API 响应结构
 */
interface VolcEngineResponse {
	ResponseMetadata: VolcEngineResponseMetadata;
	Result?: unknown;
	[key: string]: unknown;
}

/**
 * 知识库 API 响应结构
 * 参考: https://www.volcengine.com/docs/84313/1350012
 */
interface AirKnowledgeResponse {
	/** 状态码，0 表示成功 */
	code: number;
	/** 返回数据 */
	data?: unknown;
	/** 返回信息 */
	message: string;
	/** 请求 ID */
	request_id?: string;
}

/**
 * 处理火山引擎 API 响应
 * 如果响应中包含错误，则抛出 NodeApiError
 * @param context - n8n 执行上下文
 * @param response - API 响应
 * @returns 处理后的响应数据
 */
export function handleVolcEngineResponse(
	context: IExecuteFunctions,
	response: unknown,
): unknown {
	const volcResponse = response as VolcEngineResponse;

	if (volcResponse?.ResponseMetadata?.Error) {
		const error = volcResponse.ResponseMetadata.Error;
		throw new NodeApiError(context.getNode(),error as JsonObject, {
			message: error.Message as string
		});
	}

	// 返回 Result 数据，如果没有 Result 则返回空对象
	return volcResponse.Result ?? {};
}

/**
 * 处理知识库 API 响应
 * 知识库 API 返回格式: { code, data, message, request_id }
 * code === 0 表示成功，其他状态表示失败
 * @param context - n8n 执行上下文
 * @param response - API 响应
 * @returns 处理后的响应数据
 */
export function handleAirKnowledgeResponse(
	context: IExecuteFunctions,
	response: unknown,
): unknown {
	const airResponse = response as AirKnowledgeResponse;

	// code !== 0 表示请求失败
	if (airResponse?.code !== 0) {
		const errorCode = airResponse?.code ?? 'UNKNOWN';
		const errorMessage = airResponse?.message ?? '未知错误';
		const requestId = airResponse?.request_id ?? '';

		throw new NodeApiError(context.getNode(), {
			message: errorMessage,
			description: `错误码: ${errorCode}${requestId ? `, RequestId: ${requestId}` : ''}`,
			httpCode: String(errorCode),
		}, {
			message: errorMessage,
			description: `[${errorCode}] ${errorMessage}`,
			itemIndex: 0,
		});
	}

	// 返回 data 数据，如果没有 data 则返回包含 message 的对象
	return airResponse.data ?? { message: airResponse.message };
}

