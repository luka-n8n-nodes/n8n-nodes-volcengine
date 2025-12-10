import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class VolcEngineApi implements ICredentialType {
    name = 'volcEngineApi';
    displayName = '火山引擎 API';
    documentationUrl = 'https://www.volcengine.com/docs/6291/65568';
    // @ts-ignore
    icon = 'file:icon.svg';
    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://open.volcengineapi.com',
            required: true,
            description: '火山引擎 API 基础地址',
        },
        {
            displayName: 'Access Key ID',
            name: 'accessKeyId',
            type: 'string',
            default: '',
            required: true,
            description: '火山引擎 Access Key ID，从火山引擎控制台获取',
        },
        {
            displayName: 'Secret Access Key',
            name: 'secretKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            required: true,
            description: '火山引擎 Secret Access Key，从火山引擎控制台获取',
        },
        {
            displayName: 'Region',
            name: 'region',
            type: 'options',
            options: [
                {
                    name: '华北2（北京）',
                    value: 'cn-beijing',
                },
                {
                    name: '华东（杭州）- 接入点',
                    value: 'cn-hangzhou',
                },
                {
                    name: '华东2（上海）',
                    value: 'cn-shanghai',
                },
                {
                    name: '华南1（广州）',
                    value: 'cn-guangzhou',
                },
                {
                    name: '亚太东南（柔佛）',
                    value: 'ap-southeast-1',
                },
                {
                    name: '亚太东南（雅加达）',
                    value: 'ap-southeast-3',
                },
                {
                    name: '中国香港',
                    value: 'cn-hongkong',
                },
            ],
            default: 'cn-beijing',
            required: true,
            description: '火山引擎服务区域',
        },
    ];
}

