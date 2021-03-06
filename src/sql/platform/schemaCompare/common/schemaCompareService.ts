/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as azdata from 'azdata';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IConnectionManagementService } from 'sql/platform/connection/common/connectionManagement';
import { localize } from 'vs/nls';

export const SERVICE_ID = 'SchemaCompareService';
export const ISchemaCompareService = createDecorator<ISchemaCompareService>(SERVICE_ID);

export interface ISchemaCompareService {
	_serviceBrand: any;

	registerProvider(providerId: string, provider: azdata.SchemaCompareServicesProvider): void;
	schemaCompare(sourceEndpointInfo: azdata.SchemaCompareEndpointInfo, targetEndpointInfo: azdata.SchemaCompareEndpointInfo, taskExecutionMode: azdata.TaskExecutionMode): void;
	schemaCompareGenerateScript(operationId: string, targetDatabaseName: string, scriptFilePath: string, taskExecutionMode: azdata.TaskExecutionMode): void;
	schemaComparePublishChanges(operationId: string, targetServerName: string, targetDatabaseName: string, taskExecutionMode: azdata.TaskExecutionMode): void;
}

export class SchemaCompareService implements ISchemaCompareService {
	_serviceBrand: any;
	private _providers: { [handle: string]: azdata.SchemaCompareServicesProvider; } = Object.create(null);

	constructor(@IConnectionManagementService private _connectionService: IConnectionManagementService) { }

	registerProvider(providerId: string, provider: azdata.SchemaCompareServicesProvider): void {
		this._providers[providerId] = provider;
	}

	schemaCompare(sourceEndpointInfo: azdata.SchemaCompareEndpointInfo, targetEndpointInfo: azdata.SchemaCompareEndpointInfo, taskExecutionMode: azdata.TaskExecutionMode): Thenable<azdata.SchemaCompareResult> {
		return this._runAction(sourceEndpointInfo.ownerUri, (runner) => {
			return runner.schemaCompare(sourceEndpointInfo, targetEndpointInfo, taskExecutionMode);
		});
	}

	schemaCompareGenerateScript(operationId: string, targetDatabaseName: string, scriptFilePath: string, taskExecutionMode: azdata.TaskExecutionMode): Thenable<azdata.ResultStatus> {
		return this._runAction('', (runner) => {
			return runner.schemaCompareGenerateScript(operationId, targetDatabaseName, scriptFilePath, taskExecutionMode);
		});
	}

	schemaComparePublishChanges(operationId: string, targetServerName: string, targetDatabaseName: string, taskExecutionMode: azdata.TaskExecutionMode): Thenable<azdata.ResultStatus> {
		return this._runAction('', (runner) => {
			return runner.schemaComparePublishChanges(operationId, targetServerName, targetDatabaseName, taskExecutionMode);
		});
	}

	private _runAction<T>(uri: string, action: (handler: azdata.SchemaCompareServicesProvider) => Thenable<T>): Thenable<T> {
		let providerId: string = this._connectionService.getProviderIdFromUri(uri);

		if (!providerId) {
			return Promise.reject(new Error(localize('providerIdNotValidError', "Connection is required in order to interact with SchemaCompareService")));
		}
		let handler = this._providers[providerId];
		if (handler) {
			return action(handler);
		} else {
			return Promise.reject(new Error(localize('noHandlerRegistered', "No Handler Registered")));
		}
	}
}