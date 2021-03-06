/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import * as modes from 'vs/editor/common/modes';

/**
 * Set when the find widget in a webview is visible.
 */
export const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new RawContextKey<boolean>('webviewFindWidgetVisible', false);

export const IWebviewService = createDecorator<IWebviewService>('webviewService');

/**
 * Handles the creation of webview elements.
 */
export interface IWebviewService {
	_serviceBrand: any;

	createWebview(
		options: WebviewOptions,
		contentOptions: WebviewContentOptions,
	): Webview;
}

export interface WebviewOptions {
	readonly allowSvgs?: boolean;
	readonly extension?: {
		readonly location: URI;
		readonly id?: ExtensionIdentifier;
	};
	readonly enableFindWidget?: boolean;
}

export interface WebviewContentOptions {
	readonly allowScripts?: boolean;
	readonly svgWhiteList?: string[];
	readonly localResourceRoots?: ReadonlyArray<URI>;
	readonly portMappings?: ReadonlyArray<modes.IWebviewPortMapping>;
}

export interface Webview {

	contents: string;
	options: WebviewContentOptions;
	initialScrollProgress: number;
	state: string | undefined;

	readonly onDidFocus: Event<void>;
	readonly onDidClickLink: Event<URI>;
	readonly onDidScroll: Event<{ scrollYPercentage: number }>;
	readonly onDidUpdateState: Event<string | undefined>;
	readonly onMessage: Event<any>;

	sendMessage(data: any): void;
	update(
		value: string,
		options: WebviewContentOptions,
		retainContextWhenHidden: boolean
	): void;

	layout(): void;
	mountTo(parent: HTMLElement): void;
	focus(): void;
	dispose(): void;


	reload(): void;
	selectAll(): void;
	copy(): void;
	paste(): void;
	cut(): void;
	undo(): void;
	redo(): void;

	showFind(): void;
	hideFind(): void;
}
