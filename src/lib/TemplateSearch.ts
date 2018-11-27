'use strict'

import * as vscode from 'vscode'
import {TemplateGenerateCode} from './TemplateGenerateCode'
import {TemplateConfig, ConstantDefine, MessageFromUI, 
        MessageFromExtension, WebviewPanelDefine, SearchCondition,
        ResourceURI, RresourcePath } from './common'


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
                    this._search(message.condition)                    
                    return
                case MessageFromUI.TEMPLATE_VAIRABLE_SETTING:
                    const name = message.templateName
                    TemplateGenerateCode.createOrShow(this._extensionPath, this._storageMemento, name)
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

    private _search(condition:SearchCondition){
        // TODO: 补充从模板配置缓存中找到合适模板的算法
        let c = condition

        // 返回与关键字匹配的模板集
        const tplConfigs:Array<TemplateConfig> = this._storageMemento.get(ConstantDefine.MEMENTO_STORE_KEY) || []
        let result:any = []
        tplConfigs.forEach( tplConfig =>{
            result.push({
                name: tplConfig.name,
                note: tplConfig.note
            })
        })
        this._panel.webview.postMessage({
            command: MessageFromExtension.SEARCH_RESULT,
            configs: result
         })
    }

    private _update() {
        let configs : Array<TemplateConfig> = this._storageMemento.get(ConstantDefine.MEMENTO_STORE_KEY) || []
        let hasTemplateLoaded = true
        if ( configs.length == 0 ){
            hasTemplateLoaded = false
        }
        this._panel.webview.html = hasTemplateLoaded 
                                 ? ResourceURI.getHtmlContent(this._extensionPath, RresourcePath.SEARCH_PAGE_PATH) 
                                 : ResourceURI.getHtmlContent(this._extensionPath, RresourcePath.NO_TEMPLATE_PAGE_PATH)
    }
}
