/**
 * 火山引擎 AIR 知识库服务
 * 参考: https://www.volcengine.com/docs/84313/1254485
 */

import Signer from './sign';
import { createRequestFn } from './fetch';
import { OpenApiResponse, ServiceOptionsBase, HttpRequestFn, RequestInfo } from './types';

/**
 * 知识库服务配置选项
 */
export interface AirServiceOptions extends ServiceOptionsBase {
	/**
	 * 账户 ID (可选)
	 */
	accountId?: string;
	/**
	 * n8n HTTP 请求函数 (this.helpers.httpRequest)
	 */
	httpRequestFn: HttpRequestFn;
}

/**
 * 知识库请求参数
 */
export interface AirRequestParams {
	/**
	 * API 路径，如 /api/knowledge/collection/create
	 */
	pathname: string;
	/**
	 * HTTP 方法
	 */
	method?: 'GET' | 'POST';
	/**
	 * 请求体数据
	 */
	data?: Record<string, unknown>;
	/**
	 * 查询参数
	 */
	params?: Record<string, unknown>;
	/**
	 * 额外的请求头
	 */
	headers?: Record<string, string>;
}

// ============ 搜索知识库类型定义 ============

/**
 * 搜索知识库参数
 * 参考: https://www.volcengine.com/docs/84313/1350012
 */
export interface SearchKnowledgeParams {
	/** 知识库名称 */
	collection_name: string;
	/** 搜索查询内容 */
	query: string;
	/** 项目名称 */
	project?: string;
	/** 返回结果数量，默认 5 */
	limit?: number;
	/** 资源 ID */
	resource_id?: string;
	/** 是否启用多轮改写 */
	multi_round_rewrite?: boolean;
	/** 历史对话，用于多轮改写 */
	history?: Array<{
		role: 'user' | 'assistant';
		content: string;
	}>;
	/** 过滤条件 */
	filter?: Record<string, unknown>;
	/** 是否返回原始片段 */
	return_raw_chunk?: boolean;
}

/**
 * 搜索知识库响应数据
 */
export interface SearchKnowledgeResult {
	/** 检索到的知识片段列表 */
	chunks?: Array<{
		/** 片段内容 */
		content: string;
		/** 片段 ID */
		chunk_id?: string;
		/** 文档 ID */
		doc_id?: string;
		/** 相似度得分 */
		score?: number;
		/** 元数据 */
		metadata?: Record<string, unknown>;
	}>;
}

// ============ 多轮历史对话类型定义 ============

/**
 * 对话消息
 */
export interface ChatMessage {
	/** 角色: system-系统提示, user-用户, assistant-助手 */
	role: 'system' | 'user' | 'assistant';
	/** 消息内容 */
	content: string;
}

/**
 * 多轮对话请求参数
 * 参考: https://www.volcengine.com/docs/84313/1350013
 */
export interface ChatCompletionsParams {
	/** 模型名称，如 Doubao-1-5-pro-32k */
	model: string;
	/** 对话消息列表 */
	messages: ChatMessage[];
	/** 最大生成 token 数 */
	max_tokens?: number;
	/** 采样温度，范围 0-1 */
	temperature?: number;
	/** 是否流式返回 */
	stream?: boolean;
	/** 是否返回 token 使用情况 */
	return_token_usage?: boolean;
	/** 项目名称 */
	project?: string;
}

/**
 * 多轮对话响应数据
 */
export interface ChatCompletionsResult {
	/** 思维链内容（部分模型支持，如 DeepSeek-R1） */
	reasoning_content?: string;
	/** 大模型最终回答 */
	generated_answer: string;
	/** token 用量统计 (JSON 字符串) */
	usage?: string;
}

// 默认配置
const defaultOptions = {
	host: 'api-knowledgebase.mlp.cn-beijing.volces.com',
	region: 'cn-north-1',
	protocol: 'https:',
};

/**
 * 火山引擎 AIR 知识库服务类
 */
export class AirService {
	private options: AirServiceOptions;
	private requestFn: <Result>(url: string, reqInfo: RequestInfo) => Promise<OpenApiResponse<Result>>;

	constructor(options: AirServiceOptions) {
		this.options = {
			...defaultOptions,
			...options,
		};
		this.requestFn = createRequestFn(options.httpRequestFn);
	}

	/**
	 * 发送知识库 API 请求
	 * @param params 请求参数
	 */
	async request<Result>(params: AirRequestParams): Promise<OpenApiResponse<Result>> {
		const { pathname, method = 'POST', data, params: queryParams, headers: extraHeaders } = params;

		const { accessKeyId, secretKey, sessionToken, accountId } = this.options;
		if (!accessKeyId || !secretKey) {
			throw new Error('accessKeyId and secretKey is necessary');
		}

		const region = this.options.region || defaultOptions.region;
		const host = this.options.host || defaultOptions.host;
		const protocol = this.options.protocol || defaultOptions.protocol;

		// 构建请求头
		const headers: Record<string, string> = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Host: host,
			...extraHeaders,
		};

		// 如果有 accountId，添加到请求头
		if (accountId) {
			headers['V-Account-Id'] = accountId;
		}

		// 构建请求对象用于签名
		const requestObj: {
			region: string;
			method: string;
			params?: Record<string, unknown>;
			pathname: string;
			headers: Record<string, string>;
			body?: unknown;
		} = {
			region,
			method,
			pathname,
			headers,
			params: queryParams,
		};

		// 如果有 body 数据
		if (data && method === 'POST') {
			requestObj.body = data;
		}

		// 使用 Signer 进行签名 (serviceName 为 'air')
		const signer = new Signer(requestObj, 'air');
		signer.addAuthorization({ accessKeyId, secretKey, sessionToken });

		// 构建完整 URL
		let uri = `${protocol}//${host}${pathname}`;
		if (queryParams && Object.keys(queryParams).length > 0) {
			const queryString = new URLSearchParams(
				Object.entries(queryParams).map(([k, v]): [string, string] => [k, String(v)]),
			).toString();
			uri += '?' + queryString;
		}

		// 发送请求
		const reqInfo: RequestInfo = {
			method,
			headers: requestObj.headers,
		};

		if (data && method === 'POST') {
			reqInfo.data = data;
		}

		return this.requestFn<Result>(uri, reqInfo);
	}

	// ============ 知识库 API 方法 ============

	/**
	 * 搜索知识库
	 * 参考: https://www.volcengine.com/docs/84313/1350012
	 * @param params 搜索参数
	 */
	async searchKnowledge(params: SearchKnowledgeParams): Promise<OpenApiResponse<SearchKnowledgeResult>> {
		const { collection_name, query, project, limit = 5, ...rest } = params;

		const requestBody: Record<string, unknown> = {
			collection_name,
			query,
			limit,
			...rest,
		};

		if (project) {
			requestBody.project = project;
		}

		return this.request<SearchKnowledgeResult>({
			pathname: '/api/knowledge/collection/search_knowledge',
			method: 'POST',
			data: requestBody,
		});
	}

	/**
	 * 多轮历史对话
	 * 参考: https://www.volcengine.com/docs/84313/1350013
	 * @param params 对话参数
	 */
	async chatCompletions(params: ChatCompletionsParams): Promise<OpenApiResponse<ChatCompletionsResult>> {
		const {
			model,
			messages,
			max_tokens = 4096,
			temperature = 0.1,
			stream = false,
			return_token_usage = true,
			project,
		} = params;

		const requestBody: Record<string, unknown> = {
			model,
			messages,
			max_tokens,
			temperature,
			stream,
			return_token_usage,
		};

		if (project) {
			requestBody.project = project;
		}

		return this.request<ChatCompletionsResult>({
			pathname: '/api/knowledge/chat/completions',
			method: 'POST',
			data: requestBody,
		});
	}
}
