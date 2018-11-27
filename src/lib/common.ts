'use strict'

import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as Mustache from 'mustache'

export enum CodeNameRule {
	CAMEL = "camel",
    UNDERSCORE = "underscore"
}

export enum ConstantDefine {
    MY_EXTENSION_CONFIG = "code-assistant",
    MEMENTO_STORE_KEY = "_code_assistant_template_repos_",
    TEMPLATE_PATH_KEY = "template.path",
    TEMPLATE_CONFIG_KEY = "template.config.name"
}

export enum MessageFromUI {
    SEARCH_TEMPLATE = "fromUI.search",
    TEMPLATE_VAIRABLE_SETTING = "fromUI.codegen.variable.setting",
    CODE_GEN_UNTITLED = "formUI.codegen.template.untitled"

}

export enum MessageFromExtension {
    SEARCH_RESULT = "fromExt.search.result"
}

export enum WebviewPanelDefine {
    SEARCH_TEMPLATE_ID = "codeAssistantTemplateSearch",
    SEARCH_TEMPLATE_TITLE = "Code Assistant-Template Search",
    CODE_GEN_TEMPLATE_ID = "codeAssistantTemplateGen",
    CODE_GEN_TEMPLATE_TITLE = "Code Assistant-Template Generate Code"
}

export enum RresourcePath {
    SEARCH_PAGE_PATH = 'media/ui/search.html',
    NO_TEMPLATE_PAGE_PATH = 'media/ui/noTemplate.html'
}
export interface TemplateVariable {
    [properties:string]: object;
    functions: object;
    context: object;
}

export interface TemplateConfig {
    name: string;
    version: string;
    author: string;
    note: string;
    input: string;
    output: string;
    tags: Array<string>;
    source: string;
    supports: Array<string>;
    nameRule: CodeNameRule;
    infos: TemplateVariable;
    rootPath: fs.PathLike;
}

export interface SearchCondition{
    inputKeyword: string;
    outputKeyword: string;
    searchKeyword: string;
    tagKeyword: string;
    targetSupport: string;
}

export interface TemplateFilePath{
    name: string;
    filePath: fs.PathLike;
}

export class ResourceURI {
    public static getUIParamMap(extensionPath:string){
        const bootstrapCss = vscode.Uri.file(path.join(extensionPath, 'media', 'bootstrap.css')).with({ scheme: 'vscode-resource' });
        const styleCss = vscode.Uri.file(path.join(extensionPath, 'media', 'codeAssistant.css')).with({ scheme: 'vscode-resource' });
        const jqueryUri = vscode.Uri.file(path.join(extensionPath, 'media', 'jquery.js')).with({ scheme: 'vscode-resource' });
        const searchUri = vscode.Uri.file(path.join(extensionPath, 'media', 'search.js')).with({ scheme: 'vscode-resource' });
        const templateUri = vscode.Uri.file(path.join(extensionPath, 'media', 'template.js')).with({ scheme: 'vscode-resource' });
        

        return {
            bootstrapCss,
            styleCss,
            jqueryUri,
            searchUri,
            templateUri
        }
    }

    private static notFoundContent(){
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Not Found</title>                
            </head>
            <body>
                <h2 class="code-template-title">Page Not Found</h2>
            </body>
            </html>`        
    }

    public static getHtmlContent(extensionPath:string, mediaPath:string){        
        const uiPath = path.resolve(extensionPath, mediaPath)
        if ( !fs.existsSync(uiPath) ){
            console.log("ui page path invalid:"+uiPath)
            return this.notFoundContent()
        }
        const params =ResourceURI.getUIParamMap(extensionPath)
        let bf = fs.readFileSync(uiPath)
        return Mustache.render( bf.toString('utf8'), params )
    }
}