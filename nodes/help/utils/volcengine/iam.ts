/**
 * 火山引擎 IAM 服务
 * 移植自 @volcengine/openapi
 */

import Service from './service';
import { ServiceOptionsBase } from './types';

interface ListParams {
	Limit?: number;
	Offset?: number;
	Query?: string;
	[key: string]: unknown;
}

interface User {
	CreateDate: string;
	UpdateDate: string;
	Status: string;
	AccountId: number;
	UserName: string;
	Description: string;
	DisplayName: string;
	Email: string;
	MobilePhone: string;
	Trn: string;
	Source: string;
}

interface ListUserResult {
	UserMetadata: User[];
}

export class IamService extends Service {
	constructor(options?: ServiceOptionsBase) {
		super({
			...options,
			defaultVersion: '2018-01-01',
			serviceName: 'iam',
		});
	}

	ListUsers = this.createAPI<ListParams, ListUserResult>('ListUsers');
}

export const defaultService = new IamService();
