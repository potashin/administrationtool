function selectContainer(options){
    var container = document.createElement('select');
    container.innerHTML = '<option></option>';
    for(var i in options){
        container.innerHTML += '<option>' + options[i] + '</option>';
    }
    return container;
}

function createFrame(name){
    var container = document.createElement('div')
    container.id = name;
    container.innerHTML =
        '<div class="shadow tab_label" >' +
            '<div  class="closeSub" onClick="showDetails(document.getElementById(\'Subsidiary\'))">' +
                '<div class="one" ></div>' +
                '<div class="two" ></div>' +
            '</div>' +
            '<div id="infoArea" >' +
                '<h2>' + name + '</h2>' +
            '</div>' +
        '</div>' +
         '<div  class="shadow tab" style="padding: 20px;margin: 0 10%;">' +
             '<div id="head"></div>' +
             '<div id="content"></div>' +
        '</div>'
   return container;
}

function hostContainer(data){
    var container = document.createElement('div')
    container.style.width = '600px'
    container.style.margin = '0 auto'
    var table_content = '';
    for(var i = 0; i< data.rows;i++){
        table_content +=
            '<tr ">' +
                '<td style="color:'+ (data.ENABLED[i] == 'Y' ? 'black' : 'darkgrey') + '">'+ data.ID[i] + '(' + data.DESCRIPTION[i] + ')' + '</td>' +
                '<td style="width:25px"><input type="checkbox" ' + (data.ENABLED[i] == 'Y' ? ' ' : 'disabled ') + (data.ATTACHED[i] ==  'Y' ? 'checked' : '') + '></td>' +
            '</tr>'
    }
    container.innerHTML =
        '<table style="text-align: left;width:400px;margin:0 auto" cellpadding="5px">' +
            table_content +
        '</table>';

    return container;
}

function scheduleContainer(data){
    var container = document.createElement('div');
    container.innerHTML =
            '<div style="margin:0 auto;display: table;">' +
                '<div style="display:table-cell;width:100px;">' +
                    '<h4 style="float: left;padding:3px 0">Schedule :</h4>' +
                '</div>' +
                '<div style="display:table-cell;width: 200px">' +
                '</div>' +
                '<div style="display:table-cell;width:100px;">' +
                    '<button class="classname blue" style="float: left;" onClick="getData(\'Schedules\',\'Schedules\')">Add</button>' +
                '</div>' +
            '</div>' +
            '<div  style="display:none;padding: 5px 0;">' +
                '<div style="margin:0 auto;display: table">' +
                    '<div style="display:table-cell;width:100px;">' +
                        '<h4 style="float: left;padding:3px 0">Enabled :</h4>' +
                    '</div>' +
                    '<div style="display:table-cell;width: 200px;">' +
                        '<input disabled id="schedule_state" style="float: left;" type="checkbox" class="checkbox">' +
                    '</div>' +
                    '<div style="display:table-cell;width:100px;">' +
                        '<button class="classname blue" style="float: left;" onClick="getData(\'Schedules\',\'Schedules\')">Edit</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    var select = selectContainer(data.DESCRIPTION);
    select.onchange = function(){showEvents(select);}
    select.style.float = 'left'
    for(var i in select.options){
        for(var k in data.DESCRIPTION){
            if(data.DESCRIPTION[k] == select.options[i].value){
                select.options[i].title = data.IS_ENABLED[k];
                select.options[i].id = data.ID[k];
            }
        }


    }
    container.children[0].children[1].appendChild(select);
    return container;
}

function createTable(response,type){

    if(document.getElementById('content_table') != null) {
        var table = document.getElementById('content_table')
        table.parentNode.removeChild(table)
    }
    var table = document.createElement('table')
    table.id = 'content_table'

    for(var i = 0;i < response.rows+2;i++){
        table.insertRow(i);
        top:
            for(var k = 0;k < response.columns + 1;k++){
                if(response.actions || k != response.columns){
                    var cell = table.rows[i].insertCell(k);
                    if(i == 0){
                        cell.style.wordBreak = "keep-all";
                        if(k == response.columns){
                            cell.innerHTML = "";
                            cell.width = '150px';
                        }else{
                            cell.style.fontWeight = "bold"
                            cell.innerHTML = response.field[k];
                        }
                    }else if(i == response.rows+1){
                        if(k == response.columns){
                            if(response.actions){
                                var container = document.createElement("button");
                                container.className = "classname vis blue";
                                container.innerHTML = "Add";
                                var sv = function(){
                                    saveChanges(type,name);
                                    return false;
                                };
                                container.onclick = sv;
                                cell.appendChild(container);
                            }
                        }else{
                            if(response.actions){
                                var option = table.rows[i].cells[k].appendChild(document.createElement("div"));
                                if(response.options.flag){
                                    bottom:
                                        for(var c in response.options.key){
                                            if(table.rows[0].cells[k].innerHTML === response.options.key[c]){
                                                option.appendChild(selectContainer(response.options[response.options.key[c]]));
                                                continue top;
                                            }else{
                                                continue bottom;
                                            }
                                        }
                                }
                                if(table.rows[0].cells[k].innerHTML === 'IS_ENABLED' || table.rows[0].cells[k].innerHTML === 'INDIVIDUAL SETTINGS'){
                                    var check = document.createElement("input");
                                    check.type = 'checkbox';
                                    check.className = 'checkbox'
                                    option.appendChild(check);
                                } else{
                                    option.appendChild(document.createElement("input"));
                                }
                            }
                        }
                    }else{

                        cell.style.wordBreak = "break-all";

                        if(k != response.columns){

                            if(response.field[k] == 'IS_ENABLED'  || response.field[k] == 'INDIVIDUAL SETTINGS'){
                                var option = table.rows[i].cells[k].appendChild(document.createElement("div"));
                                var check = document.createElement("input");
                                check.type = 'checkbox';
                                check.className = 'checkbox';
                                check.disabled = true;
                                if(response[response.field[k]][i-1] == 'Y'){
                                    check.checked = true;
                                } else if (response[response.field[k]][i-1] == 'N') {
                                    check.checked = false;
                                }

                                option.appendChild(check);
                            } else {
                                //cell.innerHTML = response[response.field[k]][i-1];
                                var input = document.createElement("input")
                                input.value = response[response.field[k]][i-1]
                                input.disabled = true
                                cell.appendChild(input)
                            }
                            if(response.actual){
                                if(response.actual.state[i-1]){
                                    table.rows[i].cells[k].bgColor = "green";
                                }
                            }

                        }else{
                            var div = cell.appendChild(document.createElement("div"));
                            if(response.actions){
                                var container = document.createElement("button");
                                container.className = "classname vis blue";
                                container.innerHTML = "Edit";
                                var edt = function(number){
                                    return function(){
                                        editPushed(number,type,name);
                                        return false;
                                    };
                                }(i);
                                container.onclick = edt;
                                div.appendChild(container);
                            }
                            if(response.actions){
                                var container = document.createElement("button");
                                container.className = "classname vis red";
                                container.innerHTML = "Delete";
                                var dlt = function(number){
                                    return function(){
                                        deleteRow(number,type,name);
                                        return false;
                                    };
                                }(i);
                                container.onclick = dlt;
                                div.appendChild(container);
                            }
                        }
                    }

                }
            }
    }
    return table;
}


