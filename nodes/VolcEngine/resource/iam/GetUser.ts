import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';
import { getVolcEngineCredentials, createIamService } from '../../../help/utils/CredentialsHelper';

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
		// 获取凭证并创建服务
		const credentials = await getVolcEngineCredentials(this, index);
		const iamService = createIamService(credentials, this.helpers.httpRequest.bind(this.helpers));

		// 获取参数
		const userName = this.getNodeParameter('userName', index, '') as string;
		const id = this.getNodeParameter('id', index, 0) as number;

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
