'use strict'

import * as path from 'path'
import * as vscode from 'vscode'
import {TemplateConfig, ConstantDefine, MessageFromUI, MessageFromExtension, WebviewPanelDefine} from './common'

export class TemplateSearch{

    public static currentPanel: TemplateSearch | undefined
    private readonly _panel: vscode.WebviewPanel   
    private readonly _extensionPath: string
    private readonly _storageMemento: vscode.Memento
    private _disposables: vscode.Disposable[] = []

    public static createOrShow(extensionPath: string, storageMemento:vscode.Memento){
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
        if (TemplateSearch.currentPanel) {
            TemplateSearch.currentPanel._panel.reveal(column)
            return
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            WebviewPanelDefine.SEARCH_TEMPLATE_ID,
            WebviewPanelDefine.SEARCH_TEMPLATE_TITLE,
            vscode.ViewColumn.Active,
            { enableScripts: true }
        )
        
        TemplateSearch.currentPanel = new TemplateSearch(panel, extensionPath, storageMemento)
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionPath: string,
        storageMemento: vscode.Memento
    ) {
        this._panel = panel
        this._extensionPath = extensionPath
        this._storageMemento = storageMemento

        // Set the webview's initial html content 
        this._update()

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update()
            }
        }, null, this._disposables)

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case MessageFromUI.SEARCH_TEMPLATE:
                    this._search(message.text)                    
                    return
                case MessageFromUI.CODE_GEN_UNTITLED:
                    // TODO: TemplateGenerateCode.createOrShow(this._context, message.template)
                    return
            }
        }, null, this._disposables)
    }

    public dispose() {
        TemplateSearch.currentPanel = undefined

        // Clean up our resources
        this._panel.dispose()

        while (this._disposables.length) {
            const x = this._disposables.pop()
            if (x) {
                x.dispose()
            }
        }
    }

    private _search(keywords:String){
        // TODO: 补充从模板配置缓存中找到合适模板的算法

        // 返回与关键字匹配的模板集
        this._panel.webview.postMessage({
            command: MessageFromExtension.SEARCH_RESULT,
            configs: this._storageMemento.get(ConstantDefine.MEMENTO_STORE_KEY) || []
         })
    }

    private _update() {
        let configs : Array<object> = this._storageMemento.get(ConstantDefine.MEMENTO_STORE_KEY) || []
        let hasTemplateLoaded = true
        if ( configs.length == 0 ){
            hasTemplateLoaded = false
        }
        this._panel.webview.html = hasTemplateLoaded? SearchWebviewPanel.getContent(this._extensionPath) : SearchWebviewPanel.getNoTemplateContent()
    }
}

class SearchWebviewPanel {
    public static getContent(extensionPath:string){
        const jqueryUri = vscode.Uri.file(path.join(extensionPath, 'media', 'jquery.js')).with({ scheme: 'vscode-resource' });
        const searchUri = vscode.Uri.file(path.join(extensionPath, 'media', 'search.js')).with({ scheme: 'vscode-resource' });
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Template Search</title>
            <style>
            </style>
        </head>
        <body>
            <h2 class="code-template-title">Template Search</h2>
            <div>Search Template: <input id="searchContent"></input><button id="SearchCommand">Search</button></div>
            <div id="searchResult"></div>
            <script src="${jqueryUri}"></script>
            <script src="${searchUri}"></script>
        </body>
        </html>`
    }

    public static getNoTemplateContent(){
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template Search</title>
                <style>
                </style>
            </head>
            <body>
                <h2 class="code-template-title">Template Search</h2>
                <div>No Template Loaded!</div>
                <script>
                </script>
            </body>
            </html>`
    }
}