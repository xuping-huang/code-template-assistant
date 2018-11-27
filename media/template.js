const vscode = acquireVsCodeApi();

function generateCodeUntitled(filePath){    
    const variableValueMap = {};
    const formEl = $('#code-template')[0]
    debugger
    for (var i=0;i<formEl.length;i++){
        if( formEl.elements[i].type == 'text' ){
            variableValueMap[formEl.elements[i].id] = formEl.elements[i].value
        }
    }
    vscode.postMessage({
        command: 'formUI.codegen.template.untitled',
        data: variableValueMap,
        templatePath: filePath
    });    
}
