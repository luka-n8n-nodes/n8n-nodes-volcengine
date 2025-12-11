/**
 * 火山引擎 IAM 服务
 * 移植自 @volcengine/openapi
 */

import Service from './service';
import { ServiceOptionsBase, HttpRequestFn } from './types';

interface IamServiceOptions extends ServiceOptionsBase {
	httpRequestFn: HttpRequestFn;
}

export class IamService extends Service {
	constructor(options: IamServiceOptions) {
		super({
			...options,
			defaultVersion: '2018-01-01',
			serviceName: 'iam',
		});
	}
}
