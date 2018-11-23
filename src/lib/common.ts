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