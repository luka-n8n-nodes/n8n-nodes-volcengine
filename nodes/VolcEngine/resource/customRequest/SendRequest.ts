import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { Service } from '../../../help/utils/volcengine';

const SendRequestOperate: ResourceOperations = {
	name: '发送请求',
	value: 'sendRequest',
	action: '发送自定义 API 请求',
	options: [
		{
			displayName: 'Service',
			name: 'service',
			type: 'string',
			default: '',
			required: true,
			placeholder: '例如: iam, ecs, vpc',
			description: '火山引擎服务名称',
		},
		{
			displayName: 'Action',
			name: 'action',
			type: 'string',
			default: '',
			required: true,
			placeholder: '例如: ListUsers, DescribeInstances',
			description: 'API Action 名称',
		},
		{
			displayName: 'Version',
			name: 'version',
			type: 'string',
			default: '',
			required: true,
			placeholder: '例如: 2018-01-01',
			description: 'API 版本号',
		},
		{
			displayName: 'Method',
			name: 'method',
			type: 'options',
			options: [
				{
					name: 'GET',
					value: 'GET',
				},
				{
					name: 'POST',
					value: 'POST',
				},
			],
			default: 'GET',
			description: 'HTTP 请求方法',
		},
		{
			displayName: 'Send Query Parameters',
			name: 'sendQuery',
			type: 'boolean',
			default: false,
			description: 'Whether the request has query params or not',
		},
		{
			displayName: 'Specify Query Parameters',
			name: 'specifyQuery',
			type: 'options',
			displayOptions: {
				show: {
					sendQuery: [true],
				},
			},
			options: [
				{
					name: 'Using Fields Below',
					value: 'keypair',
				},
				{
					name: 'Using JSON',
					value: 'json',
				},
			],
			default: 'keypair',
		},
		{
			displayName: 'Query Parameters',
			name: 'queryParameters',
			type: 'fixedCollection',
			displayOptions: {
				show: {
					sendQuery: [true],
					specifyQuery: ['keypair'],
				},
			},
			typeOptions: {
				multipleValues: true,
			},
			placeholder: 'Add Parameter',
			default: {
				parameters: [
					{
						name: '',
						value: '',
					},
				],
			},
			options: [
				{
					name: 'parameters',
					displayName: 'Parameter',
					values: [
						{
							displayName: 'Name',
							name: 'name',
							type: 'string',
							default: '',
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
						},
					],
				},
			],
		},
		{
			displayName: 'JSON',
			name: 'jsonQuery',
			type: 'json',
			displayOptions: {
				show: {
					sendQuery: [true],
					specifyQuery: ['json'],
				},
			},
			default: '',
		},
		{
			displayName: 'Send Body',
			name: 'sendBody',
			type: 'boolean',
			displayOptions: {
				show: {
					method: ['POST'],
				},
			},
			default: false,
			description: 'Whether the request has a body or not',
		},
		{
			displayName: 'Body Content Type',
			name: 'contentType',
			type: 'options',
			displayOptions: {
				show: {
					method: ['POST'],
					sendBody: [true],
				},
			},
			options: [
				{
					name: 'JSON',
					value: 'json',
				},
				{
					name: 'Form Urlencoded',
					value: 'urlencode',
				},
			],
			default: 'json',
			description: 'Content-Type to use to send body parameters',
		},
		{
			displayName: 'Specify Body',
			name: 'specifyBody',
			type: 'options',
			displayOptions: {
				show: {
					method: ['POST'],
					sendBody: [true],
				},
			},
			options: [
				{
					name: 'Using Fields Below',
					value: 'keypair',
				},
				{
					name: 'Using JSON',
					value: 'json',
				},
			],
			default: 'keypair',
			description:
				'The body can be specified using explicit fields (keypair) or using a JavaScript object (JSON)',
		},
		{
			displayName: 'Body Parameters',
			name: 'bodyParameters',
			type: 'fixedCollection',
			displayOptions: {
				show: {
					method: ['POST'],
					sendBody: [true],
					specifyBody: ['keypair'],
				},
			},
			typeOptions: {
				multipleValues: true,
			},
			placeholder: 'Add Parameter',
			default: {
				parameters: [
					{
						name: '',
						value: '',
					},
				],
			},
			options: [
				{
					name: 'parameters',
					displayName: 'Parameter',
					values: [
						{
							displayName: 'Name',
							name: 'name',
							type: 'string',
							default: '',
							description: 'ID of the field to set',
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
							description: 'Value of the field to set',
						},
					],
				},
			],
		},
		{
			displayName: 'JSON Body',
			name: 'jsonBody',
			type: 'json',
			displayOptions: {
				show: {
					method: ['POST'],
					sendBody: [true],
					specifyBody: ['json'],
				},
			},
			default: '',
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

		// 获取节点参数
		const serviceName = this.getNodeParameter('service', index) as string;
		const action = this.getNodeParameter('action', index) as string;
		const version = this.getNodeParameter('version', index) as string;
		const method = this.getNodeParameter('method', index) as string;
		const sendQuery = this.getNodeParameter('sendQuery', index, false) as boolean;
		const sendBody = this.getNodeParameter('sendBody', index, false) as boolean;

		// 构建查询参数
		const queryParams: Record<string, string> = {};
		if (sendQuery) {
			const specifyQuery = this.getNodeParameter('specifyQuery', index, 'keypair') as string;
			if (specifyQuery === 'keypair') {
				const queryParameters = this.getNodeParameter(
					'queryParameters.parameters',
					index,
					[],
				) as Array<{ name: string; value: string }>;

				for (const param of queryParameters) {
					if (param.name) {
						queryParams[param.name] = param.value ?? '';
					}
				}
			} else {
				const jsonQuery = this.getNodeParameter('jsonQuery', index, '{}') as string;
				const parsedQuery = typeof jsonQuery === 'string' ? JSON.parse(jsonQuery) : jsonQuery;
				Object.assign(queryParams, parsedQuery);
			}
		}

		// 构建请求体
		let bodyData: Record<string, unknown> | undefined;
		let contentType: 'json' | 'urlencode' = 'json';
		if (sendBody && method === 'POST') {
			contentType = this.getNodeParameter('contentType', index, 'json') as 'json' | 'urlencode';
			const specifyBody = this.getNodeParameter('specifyBody', index, 'keypair') as string;

			if (specifyBody === 'json') {
				const jsonBody = this.getNodeParameter('jsonBody', index, '{}') as string;
				bodyData = typeof jsonBody === 'string' ? JSON.parse(jsonBody) : jsonBody;
			} else {
				const bodyParameters = this.getNodeParameter(
					'bodyParameters.parameters',
					index,
					[],
				) as Array<{ name: string; value: string }>;

				bodyData = {};
				for (const param of bodyParameters) {
					if (param.name) {
						bodyData[param.name] = param.value;
					}
				}
			}
		}

		// 创建通用服务实例
		const service = new Service({
			serviceName,
			accessKeyId,
			secretKey,
			host,
			region,
			httpRequestFn: this.helpers.httpRequest.bind(this.helpers),
		});

		// 发送请求
		const result = await service.fetchOpenAPI({
			Action: action,
			Version: version,
			method: method as 'GET' | 'POST',
			query: queryParams,
			...(bodyData ? { data: bodyData } : {}),
			headers: contentType === 'json' && bodyData ? { 'Content-Type': 'application/json' } : {},
		});

		return result as unknown as IDataObject;
	},
};

export default SendRequestOperate;

