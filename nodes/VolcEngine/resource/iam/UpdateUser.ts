import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';
import { getVolcEngineCredentials, createIamService } from '../../../help/utils/CredentialsHelper';

const UpdateUserOperate: ResourceOperations = {
	name: '更新用户信息',
	value: 'updateUser',
	action: '更新 IAM 用户信息',
	options: [
		{
			displayName: 'UserName',
			name: 'userName',
			type: 'string',
			default: '',
			required: true,
			description: '用户名',
		},
		{
			displayName: 'NewUserName',
			name: 'newUserName',
			type: 'string',
			default: '',
			description: '新用户名。长度1~64，支持英文、数字、下划线、和.-@符号。',
		},
		{
			displayName: 'NewDisplayName',
			name: 'newDisplayName',
			type: 'string',
			default: '',
			description: '新显示名。长度1~128，仅支持中文、英文、数字、空格和.-_@符号。',
		},
		{
			displayName: 'NewDescription',
			name: 'newDescription',
			type: 'string',
			default: '',
			description: '新描述。长度不超过255。',
		},
		{
			displayName: 'NewMobilePhone',
			name: 'newMobilePhone',
			type: 'string',
			default: '',
			description: '新手机号',
		},
		{
			displayName: 'NewEmail',
			name: 'newEmail',
			type: 'string',
			default: '',
			description: '新电子邮件地址',
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		// 获取凭证并创建服务
		const credentials = await getVolcEngineCredentials(this, index);
		const iamService = createIamService(credentials, this.helpers.httpRequest.bind(this.helpers));

		// 获取参数
		const userName = this.getNodeParameter('userName', index, '') as string;
		const newUserName = this.getNodeParameter('newUserName', index, '') as string;
		const newDisplayName = this.getNodeParameter('newDisplayName', index, '') as string;
		const newDescription = this.getNodeParameter('newDescription', index, '') as string;
		const newMobilePhone = this.getNodeParameter('newMobilePhone', index, '') as string;
		const newEmail = this.getNodeParameter('newEmail', index, '') as string;

		// 构建请求参数
		const params: Record<string, unknown> = {
			UserName: userName,
		};
		if (newUserName) {
			params.NewUserName = newUserName;
		}
		if (newDisplayName) {
			params.NewDisplayName = newDisplayName;
		}
		if (newDescription) {
			params.NewDescription = newDescription;
		}
		if (newMobilePhone) {
			params.NewMobilePhone = newMobilePhone;
		}
		if (newEmail) {
			params.NewEmail = newEmail;
		}

		// 调用 UpdateUser API
		const result = await iamService.fetchOpenAPI({
			Action: 'UpdateUser',
			Version: '2018-01-01',
			method: 'GET',
			query: params,
		});

		return handleVolcEngineResponse(this, result) as IDataObject;
	},
};

export default UpdateUserOperate;
