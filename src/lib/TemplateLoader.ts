'use strict'

import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import {TemplateConfig, ConstantDefine} from './common'

export class TemplateLoader {

    public static loadTemplate(extensionPath:string, storageMemento:vscode.Memento){
        const templatePath:string = vscode.workspace.getConfiguration(ConstantDefine.MY_EXTENSION_CONFIG).get(ConstantDefine.TEMPLATE_PATH_KEY) || ''
        const rootPath = path.resolve(extensionPath, templatePath)

        let configs:Array<TemplateConfig> = []
        if ( !fs.existsSync(rootPath) ){
            console.log("template path invalid:"+rootPath)
            return
        }
        this.traversingDirecotryLoadTemplate(rootPath, configs)        

        console.log("loaded template config")

        storageMemento.update(ConstantDefine.MEMENTO_STORE_KEY, configs)
    }

    private static traversingDirecotryLoadTemplate(rootPath:fs.PathLike, configs:Array<TemplateConfig>){
        const configFileName:string = vscode.workspace.getConfiguration(ConstantDefine.MY_EXTENSION_CONFIG).get(ConstantDefine.TEMPLATE_CONFIG_KEY) || ''
        const pa = fs.readdirSync(rootPath)
        pa.forEach((subItem,index)=>{
            const info = fs.statSync(rootPath+"/"+subItem)	
            if(info.isDirectory()){
                this.traversingDirecotryLoadTemplate(rootPath+"/"+subItem, configs);
            }else{
                if(subItem == configFileName){
                    const bf = fs.readFileSync(rootPath+"/"+subItem)
                    let configJson = JSON.parse(bf.toString('utf8'))
                    configJson.rootPath = rootPath
                    configs.push(configJson)
                }
            }	
        })
    }
}

