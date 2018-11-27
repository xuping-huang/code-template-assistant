import * as vscode from 'vscode'
import * as Mustache from 'mustache'
import * as fs from 'fs'
import {TemplateConfig, ConstantDefine, MessageFromUI, 
        WebviewPanelDefine, TemplateFilePath,
        ResourceURI } from './common'


export class TemplateGenerateCode{

    public static currentPanel: TemplateGenerateCode | undefined
    private readonly _panel: vscode.WebviewPanel   
    private readonly _extensionPath: string
    private readonly _storageMemento: vscode.Memento
    private _currentTemplateName: String
    private _disposables: vscode.Disposable[] = []

    public static createOrShow(extensionPath: string, storageMemento:vscode.Memento, templateName:string){
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
        if (TemplateGenerateCode.currentPanel) {
            TemplateGenerateCode.currentPanel._panel.reveal(column)
            TemplateGenerateCode.currentPanel.currentTemplate(templateName)
            return
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            WebviewPanelDefine.CODE_GEN_TEMPLATE_ID,
            WebviewPanelDefine.CODE_GEN_TEMPLATE_TITLE,
            vscode.ViewColumn.Active,
            { enableScripts: true }
        )
        
        TemplateGenerateCode.currentPanel = new TemplateGenerateCode(panel, extensionPath, storageMemento,templateName)
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionPath: string,
        storageMemento: vscode.Memento,
        templateName: string
    ) {
        this._panel = panel
        this._extensionPath = extensionPath
        this._storageMemento = storageMemento
        this._currentTemplateName = templateName

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
                case MessageFromUI.CODE_GEN_UNTITLED:
                    this._codeGenerateUntitled(message)
                    return;
            }
        }, null, this._disposables);
    }

    public currentTemplate(templateName:string){
        this._currentTemplateName = templateName
    }

    private _update() {
        let configs : Array<TemplateConfig> = this._storageMemento.get(ConstantDefine.MEMENTO_STORE_KEY) || []
        let template : TemplateConfig|undefined = configs.find(item =>{
            return item.name == this._currentTemplateName
        })
        this._panel.webview.html = this._getContent(template)
    }

    private _getContent(template:TemplateConfig|undefined){
        if ( !template ) return ResourceURI.notFoundContent()

        const resource = ResourceURI.getUIParamMap(this._extensionPath)
        
        let tpls:Array<TemplateFilePath> = []
        this._getTemplateFileContents(template.rootPath, tpls)
        let tplHtml = this._getTplListContent(tpls, template.rootPath)

        const props = Object.keys(template.infos);
        let html:Array<string> = []
        props.forEach(prop=>{
            html.push(`<div class="row">
                            <div class="col-md-12"><h2>${prop}</h2></div>
                        </div>`)
            const subinfo:any = template.infos[prop]
            const subprops = Object.keys(subinfo)

            subprops.forEach(subprop=>{
                html.push(`
                    <div class="row">
                        <div class="col-md-3">${subprop}</div>
                        <div class="col-md-4"><input type="text" id="${subprop}" name="${subprop}" class="form-control"  value="${subinfo[subprop].default}"></div>
                        <div class="col-md-5">${subinfo[subprop].note}</div>
                    </div>
                `)
            })
        })
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template Generate Code</title>
                <link rel="stylesheet" href="${resource.bootstrapCss}">
                <link rel="stylesheet" href="${resource.styleCss}">
            </head>
            <body>
                <h2 class="code-template-title">Template Generate Code</h2>
                <hr></hr>
                <form id="code-template">    
                    <div class="container">
                    ${html.join('')}
                    </div>
                </form>
                <input type="hidden" id="templatePath" value="${template.rootPath}">
                <p></p>
                <h2 class="code-template-list">Template List</h2>
                <hr></hr>
                <div id="template-list" class="container">
                    ${tplHtml}
                </div>
                <script src="${resource.jqueryUri}"></script>
                <script src="${resource.templateUri}"></script>
            </body>
            </html>
            `
    }

    private _getTemplateFileContents(rootPath:fs.PathLike, templates:Array<any>){
        var pa = fs.readdirSync(rootPath)
        var self = this
        
        pa.forEach(function(subItem,index){
            var info = fs.statSync(rootPath+"/"+subItem)	
            if(info.isDirectory()){
                self._getTemplateFileContents(rootPath+"/"+subItem, templates);
            }else{
                if(subItem.endsWith("tpl")){
                    
                    templates.push({
                        name: subItem,
                        filePath: rootPath+"/"+subItem
                    })
                }
            }	
        })
        return templates
    }

    private _getTplListContent(tpls:Array<TemplateFilePath>, rootPath: fs.PathLike){
        let rows:Array<string> = []
        tpls.forEach(tpl=>{
            const filePath = tpl.filePath.toString().replace(rootPath.toString(), "~")
            const encodePath = tpl.filePath.toString().replace(/\\/g,"/")
            rows.push(`<div class="row">
                            <div class="col-md-4"><button class="btn btn-default" onclick="generateCodeUntitled('${encodePath}')">Generate ${tpl.name}</button></div>
                            <div class="col-md-8">${filePath}</div>
                      </div>`)
        })

        return rows.join('')
    }

    private _codeGenerateUntitled(message:any){
        if ( !fs.existsSync(message.templatePath) ){
            console.log("file path invalid:"+message.templatePath)
            return
        }
        const pos = message.templatePath.lastIndexOf('/') 
        const fileName = message.templatePath.substr( pos+1 , message.templatePath.length - pos - 1 )
        let bf = fs.readFileSync(message.templatePath)
        let renderContent = Mustache.render( bf.toString('utf8'), message.data )
        this._openUntitled(renderContent, fileName)
    }

    private _openUntitled(content:string, fileName:string){
        var setting: vscode.Uri = vscode.Uri.parse(`untitled:Untitled-${fileName}`);
        vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
            vscode.window.showTextDocument(a, 1, false).then(e => {
                e.edit(edit => {
                    edit.insert(new vscode.Position(0, 0), content);
                });
            });
        }, (error: any) => {
            console.error(error);
        })
    }

    public dispose() {
        TemplateGenerateCode.currentPanel = undefined

        // Clean up our resources
        this._panel.dispose()

        while (this._disposables.length) {
            const x = this._disposables.pop()
            if (x) {
                x.dispose()
            }
        }
    }
}