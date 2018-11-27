'use strict'

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
    CODE_GEN_UNTITLED = "fromUI.codegen.untitled"
}

export enum MessageFromExtension {
    SEARCH_RESULT = "fromExt.search.result"
}

export enum WebviewPanelDefine {
    SEARCH_TEMPLATE_ID = "codeAssistantTemplateSearch",
    SEARCH_TEMPLATE_TITLE = "Code Assistant-Template Search"
}

export interface TemplateVariable {
    properties: object;
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
}

export interface SearchCondition{
    inputKeyword: string;
    outputKeyword: string;
    searchKeyword: string;
    tagKeyword: string;
    targetSupport: string;
}