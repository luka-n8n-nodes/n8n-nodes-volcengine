import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';
import { getVolcEngineCredentials, createIamService } from '../../../help/utils/CredentialsHelper';

const ListUsersOperate: ResourceOperations = {
	name: '获取用户列表',
	value: 'listUsers',
	action: '获取 IAM 用户列表',
	options: [
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			description: 'Max number of results to return',
		},
		{
			displayName: 'Offset',
			name: 'offset',
			type: 'number',
			typeOptions: {
				minValue: 0,
			},
			default: 0,
			description: '分页偏移量',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			default: '',
			description: '搜索关键词（可选）',
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		// 获取凭证并创建服务
		const credentials = await getVolcEngineCredentials(this, index);
		const iamService = createIamService(credentials, this.helpers.httpRequest.bind(this.helpers));

		// 获取参数
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const offset = this.getNodeParameter('offset', index, 0) as number;
		const query = this.getNodeParameter('query', index, '') as string;

		// 构建请求参数
		const params: Record<string, unknown> = {
			Limit: limit,
			Offset: offset,
		};
		if (query) {
			params.Query = query;
		}

		// 调用 ListUsers API
		const result = await iamService.fetchOpenAPI({
			Action: 'ListUsers',
			Version: '2018-01-01',
			method: 'GET',
			query: params,
		});

		return handleVolcEngineResponse(this, result) as IDataObject;
	},
};

export default ListUsersOperate;
