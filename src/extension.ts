'use strict'

import * as vscode from 'vscode'
import { TemplateLoader } from './lib/TemplateLoader';


export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "code-template-assistant" is now active!')

    context.subscriptions.push( vscode.commands.registerCommand('codeAssistant.templateRepositroyReload', () => {
        TemplateLoader.loadTemplate(context.extensionPath, context.globalState)
    }))

    context.subscriptions.push( vscode.commands.registerCommand('codeAssistant.templateRepositroySearch', () => {

    }))
}

// this method is called when your extension is deactivated
export function deactivate() {
}