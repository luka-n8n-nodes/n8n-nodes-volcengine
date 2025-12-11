/**
 * 火山引擎 OpenAPI 类型定义
 * 移植自 @volcengine/openapi
 */

export interface OpenApiError {
	Code?: string;
	Message: string;
	CodeN?: number;
}

export interface OpenApiResponseMetadataParams {
	RequestId?: string;
	Action?: string;
	Version?: string;
	Service?: string;
	Region?: string;
	Error?: OpenApiError;
}

export interface OpenApiResponseMetadata extends OpenApiResponseMetadataParams {
	RequestId: string;
	Service: string;
}

export interface OpenApiResponse<T> {
	ResponseMetadata: OpenApiResponseMetadata;
	Result?: T;
}

export interface RequestObj {
	region: string;
	method: string;
	params?: Record<string, unknown>;
	pathname?: string;
	headers?: Record<string, string>;
	body?: unknown;
}

export interface SignerOptions {
	bodySha256?: string;
}

export interface CredentialsBase {
	accessKeyId?: string;
	secretKey?: string;
	sessionToken?: string;
}

export interface Credentials extends CredentialsBase {
	accessKeyId: string;
	secretKey: string;
}

export interface ServiceOptionsBase extends CredentialsBase {
	/**
	 * OpenAPI host, 默认为 'cn-north-1'
	 */
	region?: string;
	/**
	 * OpenAPI host, 默认为 'open.volcengineapi.com'
	 */
	host?: string;
	serviceName?: string;
	/**
	 * 协议, 默认为 'https:'
	 */
	protocol?: string;
	/**
	 * 默认 API 版本
	 */
	defaultVersion?: string;
}

export interface ServiceOptions extends ServiceOptionsBase {
	serviceName: string;
	/**
	 * n8n HTTP 请求函数 (this.helpers.httpRequest)
	 */
	httpRequestFn: HttpRequestFn;
}

export interface FetchParams {
	Action: string;
	Version?: string;
	query?: Record<string, unknown>;
	pathname?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	data?: Record<string, unknown> | string;
	headers?: Record<string, string>;
}

export interface CreateAPIParams {
	/**
	 * OpenAPI 版本，如果不提供，将使用服务的 defaultVersion
	 */
	Version?: string;
	/**
	 * HTTP 方法，如 GET POST PUT
	 */
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	/**
	 * Body 内容类型，支持: json urlencode
	 */
	contentType?: 'json' | 'urlencode';
	/**
	 * 放在 query 中的 keys
	 */
	queryKeys?: string[];
}

/**
 * 请求信息
 */
export interface RequestInfo {
	method?: string;
	headers?: Record<string, string>;
	data?: unknown;
	params?: Record<string, unknown>;
}

/**
 * n8n HTTP 请求选项
 */
export interface N8nHttpRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	url: string;
	headers?: Record<string, string>;
	body?: string | Record<string, unknown>;
	json?: boolean;
	returnFullResponse?: boolean;
	skipSslCertificateValidation?: boolean;
	/** 忽略 HTTP 状态码错误，始终返回响应体 */
	ignoreHttpStatusErrors?: boolean;
}

/**
 * HTTP 请求函数类型
 */
export type HttpRequestFn = (options: N8nHttpRequestOptions) => Promise<unknown>;
