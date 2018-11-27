(function () {
    const vscode = acquireVsCodeApi();
    $('#searchConditionForm').on('submit', (event) => {
        event.preventDefault();
        const { target } = event;
        const condition = {};
        for (var i=0;i<target.length;i++){
            if( target.elements[i].type == 'text' ){
                condition[target.elements[i].id] = target.elements[i].value
            }
        }
        var searchContent = $('#searchContent').val();
        vscode.postMessage({
            command: 'fromUI.search',
            condition
        });
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', function(event){
        const message = event.data; 
        switch (message.command) {
            case 'fromExt.search.result':
                showSearchResult(message.configs)
                break;
        }
    });

    function showSearchResult(configs){
        $("#searchResult tr:not(:first)").empty("");
        configs.forEach( (config, index) => {
            var row = $('<tr>')
            var colInd = $('<td>',{
                html: index+1
            })
            var colName = $('<td>')
            var colDesc = $('<td>',{
                html: config.note
            })
            var link = $('<a>', {
                html: config.name,
                href: '#'
            })
            link.on('click', function(event){
                var ele = event.target
                vscode.postMessage({
                    command: 'fromUI.codegen.variable.setting',
                    templateName: ele.innerText
                });
            })            
            debugger
            colName.append(link)

            row.append(colInd, colName, colDesc)
            $("#searchResult tr:last").after(row);
        })

    }
}());