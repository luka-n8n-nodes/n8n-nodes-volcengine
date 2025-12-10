import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		rules: {
			// 禁用 n8n 社区节点限制规则，本插件需要这些依赖才能正常运行
			'@n8n/community-nodes/no-restricted-imports': 'off',
			'@n8n/community-nodes/no-restricted-globals': 'off',
			'@n8n/community-nodes/credential-test-required': 'off',
		},
	},
];
