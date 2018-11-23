'use strict'

import * as vscode from 'vscode'
import { TemplateLoader } from './lib/TemplateLoader'
import { TemplateSearch } from './lib/TemplateSearch'
import {ConstantDefine} from '../src/lib/common'

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "code-template-assistant" is now active!')

    context.subscriptions.push( vscode.commands.registerCommand('codeAssistant.templateRepositroyReload', () => {
        TemplateLoader.loadTemplate(context.extensionPath, context.globalState)
    }))

    context.subscriptions.push( vscode.commands.registerCommand('codeAssistant.templateRepositroySearch', () => {
        const templateConfig = context.globalState.get(ConstantDefine.MEMENTO_STORE_KEY)
        if( !templateConfig ){
            TemplateLoader.loadTemplate(context.extensionPath, context.globalState)
        }
        TemplateSearch.createOrShow(context.extensionPath, context.globalState)
    }))
}

// this method is called when your extension is deactivated
export function deactivate() {
}