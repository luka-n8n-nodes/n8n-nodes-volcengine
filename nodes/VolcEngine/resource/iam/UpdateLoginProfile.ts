import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { IamService } from '../../../help/utils/volcengine';
import { handleVolcEngineResponse } from '../../../help/utils/ResponseUtils';

const UpdateLoginProfileOperate: ResourceOperations = {
	name: '更新用户登录配置',
	value: 'updateLoginProfile',
	action: '更新 IAM 用户登录配置',
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
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: '登录密码',
		},
		{
			displayName: 'LoginAllowed',
			name: 'loginAllowed',
			type: 'options',
			options: [
				{
					name: '允许登录',
					value: 'true',
				},
				{
					name: '不允许登录',
					value: 'false',
				},
			],
			default: 'true',
			description: '是否允许登录。true代表允许，false代表不允许，默认为false。',
		},
		{
			displayName: 'PasswordResetRequired',
			name: 'passwordResetRequired',
			type: 'options',
			options: [
				{
					name: '需要重设密码',
					value: 'true',
				},
				{
					name: '不需要重设密码',
					value: 'false',
				},
			],
			default: 'false',
			description: '下次登录是否需要重设密码。true代表允许，false代表不允许，默认为false。',
		},
		{
			displayName: 'SafeAuthFlag',
			name: 'safeAuthFlag',
			type: 'options',
			options: [
				{
					name: '开启登录保护',
					value: 'true',
				},
				{
					name: '不开启登录保护',
					value: 'false',
				},
			],
			default: 'false',
			description: '是否开启登录保护。true代表开启，false代表不开启，默认为false。',
		},
		{
			displayName: 'SafeAuthType',
			name: 'safeAuthType',
			type: 'options',
			options: [
				{
					name: 'Email',
					value: 'email',
				},
				{
					name: 'MFA',
					value: 'vmfa',
				},
				{
					name: 'Phone',
					value: 'phone',
				},
				{
					name: 'Phone + Email',
					value: 'phone,email',
				},
			],
			default: 'phone',
			description: '登录保护类型。phone代表手机验证，email代表邮箱验证，vmfa代表MFA设备验证。支持设置多种操作保护类型，以英文逗号分隔。',
		},
		{
			displayName: 'SafeAuthExemptRequired',
			name: 'safeAuthExemptRequired',
			type: 'options',
			options: [
				{
					name: '不开启登录保护豁免',
					value: '0',
				},
				{
					name: '开启登录保护豁免',
					value: '1',
				},
			],
			default: '0',
			description: '是否开启登录保护豁免。0代表不开启，1代表开启。开启登录保护豁免后，验证完成后一定时间内登录将不再进行验证。',
		},
		{
			displayName: 'SafeAuthExemptUnit',
			name: 'safeAuthExemptUnit',
			type: 'options',
			options: [
				{
					name: '分钟',
					value: '0',
				},
				{
					name: '小时',
					value: '1',
				},
				{
					name: '天',
					value: '2',
				},
			],
			default: '0',
			description: '豁免的时间单位。0代表分钟，1代表小时，2代表天。',
		},
		{
			displayName: 'SafeAuthExemptDuration (分钟)',
			name: 'safeAuthExemptDurationMinutes',
			type: 'number',
			default: 5,
			typeOptions: {
				minValue: 5,
				maxValue: 1440,
			},
			displayOptions: {
				show: {
					safeAuthExemptUnit: ['0'],
				},
			},
			description: '登录保护豁免时长（分钟）。范围：5-1440分钟。',
		},
		{
			displayName: 'SafeAuthExemptDuration (小时)',
			name: 'safeAuthExemptDurationHours',
			type: 'number',
			default: 1,
			typeOptions: {
				minValue: 1,
				maxValue: 168,
			},
			displayOptions: {
				show: {
					safeAuthExemptUnit: ['1'],
				},
			},
			description: '登录保护豁免时长（小时）。范围：1-168小时。',
		},
		{
			displayName: 'SafeAuthExemptDuration (天)',
			name: 'safeAuthExemptDurationDays',
			type: 'number',
			default: 1,
			typeOptions: {
				minValue: 1,
				maxValue: 7,
			},
			displayOptions: {
				show: {
					safeAuthExemptUnit: ['2'],
				},
			},
			description: '登录保护豁免时长（天）。范围：1-7天。',
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
		const password = this.getNodeParameter('password', index, '') as string;
		const loginAllowed = this.getNodeParameter('loginAllowed', index, '') as string;
		const passwordResetRequired = this.getNodeParameter('passwordResetRequired', index, '') as string;
		const safeAuthFlag = this.getNodeParameter('safeAuthFlag', index, '') as string;
		const safeAuthType = this.getNodeParameter('safeAuthType', index, '') as string;
		const safeAuthExemptRequired = this.getNodeParameter('safeAuthExemptRequired', index, '') as string;
		const safeAuthExemptUnit = this.getNodeParameter('safeAuthExemptUnit', index, '') as string;

		// 创建 IAM 服务实例
		const iamService = new IamService({
			accessKeyId,
			secretKey,
			host,
			region,
			httpRequestFn: this.helpers.httpRequest.bind(this.helpers),
		});

		// 构建请求参数
		const params: Record<string, unknown> = {
			UserName: userName,
		};
		if (password) {
			params.Password = password;
		}
		if (loginAllowed) {
			params.LoginAllowed = loginAllowed === 'true';
		}
		if (passwordResetRequired) {
			params.PasswordResetRequired = passwordResetRequired === 'true';
		}
		if (safeAuthFlag) {
			params.SafeAuthFlag = safeAuthFlag === 'true';
		}
		if (safeAuthType) {
			params.SafeAuthType = safeAuthType;
		}
		if (safeAuthExemptRequired) {
			params.SafeAuthExemptRequired = parseInt(safeAuthExemptRequired, 10);
		}
		if (safeAuthExemptUnit) {
			params.SafeAuthExemptUnit = parseInt(safeAuthExemptUnit, 10);

			// 根据单位获取对应的时长
			let duration: number;
			if (safeAuthExemptUnit === '0') {
				duration = this.getNodeParameter('safeAuthExemptDurationMinutes', index, 5) as number;
			} else if (safeAuthExemptUnit === '1') {
				duration = this.getNodeParameter('safeAuthExemptDurationHours', index, 1) as number;
			} else {
				duration = this.getNodeParameter('safeAuthExemptDurationDays', index, 1) as number;
			}
			params.SafeAuthExemptDuration = duration;
		}

		// 调用 UpdateLoginProfile API
		const result = await iamService.fetchOpenAPI({
			Action: 'UpdateLoginProfile',
			Version: '2018-01-01',
			method: 'GET',
			query: params,
		});

		return handleVolcEngineResponse(this, result) as IDataObject;
	},
};

export default UpdateLoginProfileOperate;
