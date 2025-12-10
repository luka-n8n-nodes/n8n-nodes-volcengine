import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { IamService } from '../../../help/utils/volcengine';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';

const GetUserOperate: ResourceOperations = {
	name: '查询用户详情',
	value: 'getUser',
	action: '查询 IAM 用户详情',
	options: [
		{
			displayName: 'UserName',
			name: 'userName',
			type: 'string',
			default: '',
			description: '用户名，长度1~64，仅支持英文、数字、下划线等',
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'number',
			default: 0,
			description: '用户 ID',
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
		const userName = this.getNodeParameter('userName', index, '') as string;
		const id = this.getNodeParameter('id', index, 0) as number;

		// 创建 IAM 服务实例
		const iamService = new IamService();
		iamService.setAccessKeyId(accessKeyId);
		iamService.setSecretKey(secretKey);
		iamService.setHost(host);
		iamService.setRegion(region);

		// 构建请求参数（UserName 和 ID 二选一）
		const params: Record<string, unknown> = {};
		if (userName) {
			params.UserName = userName;
		} else if (id) {
			params.ID = id;
		}

		// 调用 GetUser API
		const result = await iamService.fetchOpenAPI({
			Action: 'GetUser',
			Version: '2018-01-01',
			method: 'GET',
			query: params,
		});

		return handleVolcEngineResponse(this, result) as IDataObject;
	},
};

export default GetUserOperate;

