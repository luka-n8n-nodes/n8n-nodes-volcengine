import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { AirService } from '../../../help/utils/volcengine';
import { handleAirKnowledgeResponse } from '../../../help/utils/ResponseUtils';

const SearchKnowledgeOperate: ResourceOperations = {
	name: 'Search Knowledge',
	value: 'searchKnowledge',
	action: '搜索 Viking 知识库',
	options: [
		{
			displayName: 'Collection Name',
			name: 'collectionName',
			type: 'string',
			required: true,
			default: '',
			description: '要搜索的知识库名称',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			required: true,
			default: '',
			description: '搜索查询内容',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			// eslint-disable-next-line
			default: 5,
			description: 'Max number of results to return',
			typeOptions: {
				minValue: 1,
			},
		},
		{
			displayName: 'Project',
			name: 'project',
			type: 'string',
			default: '',
			description: '项目名称（可选）',
		},
		{
			displayName: 'Additional Fields',
			name: 'advancedOptions',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			options: [
				{
					displayName: 'Filter',
					name: 'filter',
					type: 'json',
					default: '{}',
					description: '过滤条件，JSON 格式',
				},
				{
					displayName: 'History',
					name: 'history',
					type: 'json',
					default: '[]',
					description:
						'历史对话记录，用于多轮改写。格式: [{"role": "user", "content": "问题"}, {"role": "assistant", "content": "回答"}]',
				},
				{
					displayName: 'Multi Round Rewrite',
					name: 'multiRoundRewrite',
					type: 'boolean',
					default: false,
					description: 'Whether to enable 多轮改写，可以利用历史对话优化搜索',
				},
				{
					displayName: 'Resource ID',
					name: 'resourceId',
					type: 'string',
					default: '',
					description: '资源 ID（可选）',
				},
				{
					displayName: 'Return Raw Chunk',
					name: 'returnRawChunk',
					type: 'boolean',
					default: false,
					description: 'Whether to return 原始片段',
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
		const collectionName = this.getNodeParameter('collectionName', index) as string;
		const query = this.getNodeParameter('query', index) as string;
		const limit = this.getNodeParameter('limit', index, 5) as number;
		const project = this.getNodeParameter('project', index, '') as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index, {}) as IDataObject;

		// 创建 AIR 服务实例
		const airService = new AirService({
			accessKeyId,
			secretKey,
			region,
			httpRequestFn: this.helpers.httpRequest.bind(this.helpers),
		});

		// 构建请求参数
		const params: Record<string, unknown> = {
			collection_name: collectionName,
			query,
			limit,
		};

		if (project) {
			params.project = project;
		}

		// 处理高级选项
		if (advancedOptions.multiRoundRewrite) {
			params.multi_round_rewrite = true;
		}

		if (advancedOptions.history) {
			try {
				const history =
					typeof advancedOptions.history === 'string'
						? JSON.parse(advancedOptions.history)
						: advancedOptions.history;
				if (Array.isArray(history) && history.length > 0) {
					params.history = history;
				}
			} catch {
				// 忽略解析错误
			}
		}

		if (advancedOptions.filter) {
			try {
				const filter =
					typeof advancedOptions.filter === 'string'
						? JSON.parse(advancedOptions.filter)
						: advancedOptions.filter;
				if (Object.keys(filter).length > 0) {
					params.filter = filter;
				}
			} catch {
				// 忽略解析错误
			}
		}

		if (advancedOptions.returnRawChunk) {
			params.return_raw_chunk = true;
		}

		if (advancedOptions.resourceId) {
			params.resource_id = advancedOptions.resourceId;
		}

		// 调用搜索知识库 API
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await airService.searchKnowledge(params as any);

		return handleAirKnowledgeResponse(this, result) as IDataObject;
	},
};

export default SearchKnowledgeOperate;
