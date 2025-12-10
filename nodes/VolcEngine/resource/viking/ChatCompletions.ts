import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { AirService } from '../../../help/utils/volcengine';
import { handleAirKnowledgeResponse } from '../../../help/utils/ResponseUtils';

const ChatCompletionsOperate: ResourceOperations = {
	name: 'Chat Completions',
	value: 'chatCompletions',
	action: 'Viking 知识库多轮对话',
	options: [
		{
			displayName: 'Model',
			name: 'model',
			type: 'options',
			required: true,
			default: 'Doubao-1-5-pro-32k',
			description: '选择对话模型',
			/* eslint-disable */
			options: [
				{ name: 'Deepseek-R1-128k', value: 'Deepseek-R1-128k' },
				{ name: 'Deepseek-V3-128k', value: 'Deepseek-V3-128k' },
				{ name: 'Doubao-1-5-lite-32k', value: 'Doubao-1-5-lite-32k' },
				{ name: 'Doubao-1-5-pro-256k', value: 'Doubao-1-5-pro-256k' },
				{ name: 'Doubao-1-5-pro-32k', value: 'Doubao-1-5-pro-32k' },
				{ name: 'Doubao-1-5-thinking-pro', value: 'Doubao-1-5-thinking-pro' },
				{ name: 'Doubao-1-5-vision-lite', value: 'Doubao-1-5-vision-lite' },
				{ name: 'Doubao-1-5-vision-pro', value: 'Doubao-1-5-vision-pro' },
				{ name: 'Doubao-1-5-vision-pro-32k', value: 'Doubao-1-5-vision-pro-32k' },
				{ name: 'Doubao-lite-128k', value: 'Doubao-lite-128k' },
				{ name: 'Doubao-lite-32k', value: 'Doubao-lite-32k' },
				{ name: 'Doubao-pro-128k', value: 'Doubao-pro-128k' },
				{ name: 'Doubao-pro-256k', value: 'Doubao-pro-256k' },
				{ name: 'Doubao-pro-32k', value: 'Doubao-pro-32k' },
				{ name: 'Doubao-Seed-1-6', value: 'Doubao-Seed-1-6' },
				{ name: 'Doubao-Seed-1-6-flash', value: 'Doubao-Seed-1-6-flash' },
				{ name: 'Doubao-Seed-1-6-thinking', value: 'Doubao-Seed-1-6-thinking' },
				{ name: 'Doubao-Seed-1-6-vision', value: 'Doubao-Seed-1-6-vision' },
				{ name: 'Doubao-vision-pro-32k', value: 'Doubao-vision-pro-32k' },
			],
			/* eslint-enable */
		},
		{
			displayName: 'Messages',
			name: 'userQuery',
			type: 'string',
			required: true,
			default: '',
			description: '当前用户的问题',
			typeOptions: {
				rows: 3,
			},
		},
		{
			displayName: 'System Prompt',
			name: 'systemPrompt',
			type: 'string',
			default: '',
			description: '系统提示词，设定 AI 的行为和角色',
			typeOptions: {
				rows: 3,
			},
		},
		{
			displayName: 'History',
			name: 'history',
			type: 'json',
			default: '[]',
			description:
				'历史对话消息列表。格式: [{"role": "user", "content": "问题"}, {"role": "assistant", "content": "回答"}]',
		},
		{
			displayName: 'Additional Fields',
			name: 'advancedOptions',
			type: 'collection',
			placeholder: 'Add Field, more details: https://www.volcengine.com/docs/84313/1350013?lang=zh',
			default: {},
			options: [
				{
					displayName: 'Max Tokens',
					name: 'maxTokens',
					type: 'number',
					default: 4096,
					description: '生成回答的最大 Token 数量',
				},
				{
					displayName: 'Temperature',
					name: 'temperature',
					type: 'number',
					default: 0.1,
					description: '采样温度，范围 0-1，值越高回答越随机',
					typeOptions: {
						minValue: 0,
						maxValue: 1,
						numberStepSize: 0.1,
					},
				},
				{
					displayName: 'Return Token Usage',
					name: 'returnTokenUsage',
					type: 'boolean',
					default: true,
					description: 'Whether to return Token 使用统计信息',
				},
				{
					displayName: 'Project',
					name: 'project',
					type: 'string',
					default: '',
					description: '项目名称（可选）',
				},
			],
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		// 获取凭证
		const credentials = await this.getCredentials('volcEngineApi', index);
		const accessKeyId = credentials.accessKeyId as string;
		const secretKey = credentials.secretKey as string;
		const region = (credentials.region as string) || 'cn-north-1';

		// 获取参数
		const model = this.getNodeParameter('model', index) as string;
		const userQuery = this.getNodeParameter('userQuery', index) as string;
		const systemPrompt = this.getNodeParameter('systemPrompt', index, '') as string;
		const historyJson = this.getNodeParameter('history', index, '[]') as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index, {}) as IDataObject;

		// 创建 AIR 服务实例
		const airService = new AirService();
		airService.setAccessKeyId(accessKeyId);
		airService.setSecretKey(secretKey);
		airService.setRegion(region);

		// 构建消息列表
		const messages: Array<{ role: string; content: string }> = [];

		// 添加系统提示
		if (systemPrompt) {
			messages.push({
				role: 'system',
				content: systemPrompt,
			});
		}

		// 添加历史对话
		try {
			const history = typeof historyJson === 'string' ? JSON.parse(historyJson) : historyJson;
			if (Array.isArray(history)) {
				messages.push(...history);
			}
		} catch (e) {
			// 忽略解析错误
		}

		// 添加当前用户问题
		messages.push({
			role: 'user',
			content: userQuery,
		});

		// 构建请求参数（stream 固定为 false，n8n 节点不支持流式返回）
		const params: Record<string, unknown> = {
			model,
			messages,
			max_tokens: (advancedOptions.maxTokens as number) || 4096,
			temperature: (advancedOptions.temperature as number) ?? 0.1,
			stream: false,
			return_token_usage: advancedOptions.returnTokenUsage !== false,
		};

		if (advancedOptions.project) {
			params.project = advancedOptions.project;
		}

		// 调用多轮对话 API
		const result = await airService.chatCompletions(params as any);

		return handleAirKnowledgeResponse(this, result) as IDataObject;
	},
};

export default ChatCompletionsOperate;
