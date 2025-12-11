/**
 * 资源类型枚举
 */
export declare const enum ResourceType {
	IAM = 'iam',
	Viking = 'viking',
	CustomRequest = 'customRequest',
}

/**
 * 操作类型枚举
 */
export declare const enum OperationType {
	// IAM 用户操作
	GetUser = 'GetUser',
	ListUsers = 'ListUsers',
	UpdateUser = 'UpdateUser',
	UpdateLoginProfile = 'UpdateLoginProfile',

	// Viking 知识库操作
	ChatCompletions = 'ChatCompletions',
	SearchKnowledge = 'SearchKnowledge',

	// 自定义请求操作
	SendRequest = 'SendRequest',
}

/**
 * 输出类型枚举
 */
export declare const enum OutputType {
	Single = 'single',
	Multiple = 'multiple',
	None = 'none',
}

/**
 * 凭证类型枚举
 */
export declare const enum Credentials {
	VolcEngineApi = 'volcEngineApi',
}

