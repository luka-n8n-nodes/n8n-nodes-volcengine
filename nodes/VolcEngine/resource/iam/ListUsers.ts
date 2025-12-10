import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { IamService } from '../../../help/utils/volcengine';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';

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
		// 获取凭证
		const credentials = await this.getCredentials('volcEngineApi', index);
		const baseUrl = (credentials.baseUrl as string) || 'https://open.volcengineapi.com';
		const accessKeyId = credentials.accessKeyId as string;
		const secretKey = credentials.secretKey as string;
		const region = credentials.region as string;

		// 从 baseUrl 提取 host
		const urlObj = new URL(baseUrl);
		const host = urlObj.host;

		// 获取参数
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const offset = this.getNodeParameter('offset', index, 0) as number;
		const query = this.getNodeParameter('query', index, '') as string;

		// 创建 IAM 服务实例
		const iamService = new IamService();
		iamService.setAccessKeyId(accessKeyId);
		iamService.setSecretKey(secretKey);
		iamService.setHost(host);
		iamService.setRegion(region);

		// 调用 ListUsers API
		const result = await iamService.ListUsers({
			Limit: limit,
			Offset: offset,
			...(query ? { Query: query } : {}),
		});

		return handleVolcEngineResponse(this, result) as IDataObject;
	},
};

export default ListUsersOperate;

