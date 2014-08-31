function selectContainer(options,description,selected){
    var container = document.createElement('select')
    for(var i in options){
        container.innerHTML += '<option ' + ( options[i] == selected ? 'selected' : '') + ' value="' + options[i] + '" label="' + description[i] + '"></option>'
    }
    return container
}

function createFrame(name,id){
    var container = document.createElement('div')
    container.id = name
    container.innerHTML =
        '<div class="shadow tab_label" >' +
            '<div  class="closeSub" onClick="showDetails(document.getElementById(\'' + id + '\'))">' +
                '<div class="one" ></div>' +
                '<div class="two" ></div>' +
            '</div>' +
            '<div id="infoArea" >' +
                '<h2 id="' + id + '_header_name">' + name + '</h2>' +
            '</div>' +
        '</div>' +
         '<div  class="shadow tab" style="padding: 20px;margin: 0 10%;">' +
             '<div id="'+ id +'_head"></div>' +
             '<div id="'+ id +'_content"></div>' +
        '</div>'
   return container
}

function hostContainer(parameters,data,type){
    var container = document.createElement('div')
    container.style.margin = '0 auto'
    var table_content = '';
    for(var i = 0; i< data.rows;i++){
        var color = data.content.IS_ENABLED[i] == 'Y' ? 'black' : 'red'
        table_content +=
            '<tr style="color:'+ color + '">' +
                '<td ><input disabled style="color: ' + color+ '" name="HOSTID" value="' + data.content.HOSTID[i] + '"/></td>' +
                '<td >' + data.content.DESCRIPTION[i] + '</td>' +
                '<td style="width:25px"><input name="IS_ENABLED" type="checkbox" ' + (data.content.IS_ENABLED[i] == 'Y' ? ' ' : 'disabled ') + (data.content.ATTACHED[i] ==  'Y' ? 'checked' : '') + '></td>' +
                '</tr>'
    }
    container.innerHTML =
        '<table style="text-align: left;width:400px;margin:0 auto" cellpadding="5px">' +
            table_content +
            '</table>';
    var onChangeAttach = container.querySelectorAll('tr')
    for(var i = 0; i < onChangeAttach.length; i++){
        var att = function(element){
            return function(){
                postInput(parameters, element,type)
                return false
            }
        }(onChangeAttach[i])
        onChangeAttach[i].onchange = att;
    }
    return container;
}

function scheduleContainer(data,selected){
    var select = selectContainer(data.content.ID,data.content.DESCRIPTION,selected);
    var container = document.createElement('div');
    container.innerHTML =
            '<div style="margin:0 auto;display: table;">' +
                '<div style="display:table-cell;width:100px;">' +
                    '<h4 style="float: left;padding:3px 0">Schedule :</h4>' +
                '</div>' +
                '<div style="display:table-cell;width: 200px">' +
                '</div>' +
                '<div style="display:table-cell;width:200px;">' +
                    '<button class="blue" style="float: left;" onClick="getData(\'SA\',\'Add Schedule\',null)">Add</button>' +
                    '<button class="blue" style="float: left;" onClick="getData(\'SC\',\'Edit Schedule\', document.querySelector(\'#Subsidiary_head select\'))">Edit</button>' +
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
                    '<div style="display:table-cell;width:200px;">' +
                        '<button class="blue" style="float: left;"  onClick="getData(\'EC\',\'Calendar\', null)">Exclusions</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

    select.onchange = function(){getData('LE', null, select)}
    select.style.float = 'left'
    for(var i in select.options){
        for(var k in data.content.DESCRIPTION){
            if(data.content.ID[k] == select.options[i].value){
                select.options[i].title = data.content.IS_ENABLED[k]
            }
        }


    }
    container.children[0].children[1].appendChild(select);
    return container;
}

function appForm(response,type,parameters){
    if(document.getElementById('popup_table') != null) {
        var table = document.getElementById('popup_table')
        table.parentNode.removeChild(table)
    }
    var table = document.createElement('table')
    table.id = 'popup_table'
    response.fields = response.include
    response.columns = Object.keys(response.include).length

    table.style.textAlign = 'left'
    table.cellPadding = '5px'

    if(type == 'CS') parameters = {'APP_NAME': '',INSTANCEID: ''}
    for(var i = 0;i < response.columns + 1 ;i++){
        if(i == response.columns && Object.keys(response.ignore).length > 0){
            var attachments = {}
            if(!parameters.hasOwnProperty('INSTANCEID')){
                attachments.Instances = {
                    'ENABLED' : response.content.ENABLED_INSTANCES,
                    'DISABLED' : response.content.DISABLED_INSTANCES,

                    'ONCLICK' : {
                        0 : {
                            'TYPE' : 'AI',
                            'NAME' : 'Instance Attachment',
                            'VALUE' : 'Edit'
                        }
                    }
                }
            }
            attachments.Hosts = {
                'ENABLED' : response.content.ENABLED_HOSTS,
                'DISABLED' : response.content.DISABLED_HOSTS,
                'ONCLICK' : {
                    0 : {
                        'TYPE' : type.charAt(0) + 'H',
                        'NAME' : 'Hosts Attachment',
                        'VALUE' : 'Edit'
                    },
                    1 : {
                        'TYPE' : 'LH',
                        'NAME' : 'Hosts',
                        'VALUE' : 'Show'
                    }

                }
            }

            attachments.Events = {
                'ENABLED' : response.content.ENABLED_EVENTS,
                'DISABLED' : response.content.DISABLED_EVENTS,
                'ONCLICK' : {
                    0 : {
                        'TYPE' : type.charAt(0) + 'E',
                        'NAME' : 'Event Mapping',
                        'VALUE' : 'Edit'
                    }
                }
            }

            for(var t in attachments){
                var row = table.insertRow(-1)
                row.insertCell(0).innerHTML = '<h4>' + t + '</h4>'
                var cell = row.insertCell(1)
                for(var y in attachments[t]){
                    if(y != 'ONCLICK' && attachments[t][y][0] != ''){
                        var e = document.createElement('span');
                        e.innerHTML = attachments[t][y][0]
                        e.style.color = y === 'DISABLED' ? 'red' : 'black'
                        cell.appendChild(e)
                    }
                }
                if(cell.innerHTML == '' && type == 'IS'){
                    cell.innerHTML = 'Inherited from ' + response.content.APP_NAME[0]
                }
                var cell = row.insertCell(2)

                for(var u in attachments[t]['ONCLICK']){
                    var e = document.createElement('input')
                    e.type = 'button'
                    e.value = attachments[t]['ONCLICK'][u]['VALUE']
                    e.className = 'blue'
                    e.onclick = function(p){
                        return function(){
                            getData(p['TYPE'],p['NAME'],JSON.stringify(parameters))
                        }
                    }(attachments[t]['ONCLICK'][u])
                    cell.appendChild(e)
                }



            }
        }
        var row = table.insertRow(-1);
        for(var k = 0;k < response.rows + 1 + (response.action.INSERT ? 1 : 0);k++){
            var cell = row.insertCell(k)
            buildHTML(row,cell,k,i,response,type,parameters)
        }

    }
    var button = document.createElement('input')
    var schedule = table.querySelector('select[name="SCHEDULE"]')

    button.type = 'button'
    button.value = 'Show'
    button.className = 'blue'
    button.onclick = function(){
        return getData('SH', 'Schedules & Events', schedule)
    }
    schedule.parentNode.parentNode.insertCell(-1).appendChild(button)

    return table;
}


function createTable(response,type,parameters){

    if(document.getElementById('content_table') != null) {
        var table = document.getElementById('content_table')
        table.parentNode.removeChild(table)
    }
    var table = document.createElement('table')
    table.id = 'content_table'
    if(type === 'LE'){
        response.fields = response.include
        response.columns = Object.keys(response.fields).length
    }
    for(var i = 0;i < response.rows+2;i++){
        var row = table.insertRow(i);
            for(var k = 0;k < response.columns + 1;k++){
                var cell = table.rows[i].insertCell(k);
                buildHTML(row,cell,i,k,response,type,parameters)
            }
    }
    if(response.content.hasOwnProperty('ACTUAL')){
        Object.keys(response.content.ACTUAL).forEach(function(k) {
            if (response.content.ACTUAL[k]) {
                k++
                for(var i = 0 ;i < response.columns ;i++){
                    table.rows[k].cells[i].bgColor = 'green'
                }
            }
        });
    }
    return table;
}

function buildHTML(row,cell,i,k,response,type,parameters){
    if(k == 0 && i > 0){
        var hidden = document.createElement("input");
        hidden.type = 'hidden'
        hidden.name = 'TYPE'
        cell.appendChild(hidden)
    }
    if(i == 0){
        cell.style.wordBreak = "keep-all";
        if(k == response.columns){
            cell.innerHTML = "";
            cell.width = '150px';
        }else{
            var header = response.field[k].charAt(0) + response.field[k].slice(1).replace('_', ' ').toLowerCase();
            cell.innerHTML = '<h4>' + header + '</h4>';
        }
    }else if(i == response.rows+1 && response.action.INSERT === true){

        if(k == response.columns){
            var container = document.createElement("button");
            container.className = "vis blue";
            container.innerHTML = "Add";
            var sv = function(element){
                return function(){
                    postInput(parameters,element, type, 'INSERT');
                    return false;
                };
            }(type == 'CS'? row.parentNode :row);
            container.onclick = sv;
            cell.appendChild(container);
        } else if(response.field[k] !== 'INDIVIDUAL_SETTINGS'){
            if(response.options && (response.field[k] in  response.options)){
                var input = selectContainer(response.options[response.field[k]]['VALUE'],response.options[response.field[k]]['LABEL'])
            } else if(response.field[k] === 'IS_ENABLED'){
                var input = document.createElement("input");
                input.type = 'checkbox';
            }else if(response.field[k] === 'CONFIG'){
                var input = document.createElement("textarea");
            } else {
                var input = document.createElement("input")
                input.type = 'text';
            }
            input.name = response.field[k]
            cell.appendChild(input);
        }
    }else if(i !== response.rows+1){
        if(k != response.columns){
            cell.style.wordBreak = "break-all";
            for(var g in response.include){
                if(response.include[g] === response.field[k]) {
                    if(response.options && (response.field[k] in  response.options)){
                        var input = selectContainer(
                            response.options[response.field[k]]['VALUE'],
                            response.options[response.field[k]]['LABEL'],
                            response.content[response.field[k]][i-1])
                    }else if(response.field[k] === 'CONFIG'){
                        var input = document.createElement("textarea");
                        input.value = response.content[response.field[k]][i-1]
                    }else{
                        var input = document.createElement("input");
                        if(response.field[k] == 'IS_ENABLED'){
                            input.type = 'checkbox';

                            if(response.content[response.field[k]][i-1] == 'Y'){
                                input.checked = true;
                            } else if (response.content[response.field[k]][i-1] == 'N') {
                                input.checked = false;
                            }
                        } else {
                            input.type = 'text';
                            input.value = response.content[response.field[k]][i-1]
                        }
                    }
                    if(type === 'IS')input.placeholder = 'Inherited from ' + response.content.APP_NAME[0]

                    input.disabled = (response.disabled.hasOwnProperty(response.field[k]) ? true :  false)
                    input.name = response.field[k]
                    cell.appendChild(input)
                    break
                }
            }
            for(var g in response.ignore){
                if(response.ignore[g] === response.field[k]) {
                    if(response.field[k] == 'INDIVIDUAL_SETTINGS'){
                        var input = document.createElement("input");
                        input.type = 'checkbox';
                        input.disabled = true;
                        if(response.content[response.field[k]][i-1] == 'Y'){
                            input.checked = true;
                        } else if (response.content[response.field[k]][i-1] == 'N') {
                            input.checked = false;
                        }
                        cell.appendChild(input)
                    }else{
                        cell.innerHTML = response.content[response.field[k]][i-1]
                        if(type === 'IS')input.placeholder = 'Inherited from ' + response.content.APP_NAME[0]
                    }

                }
            }
        }else{
            var div = cell.appendChild(document.createElement("div"));
            if(response.action.UPDATE){
                var container = document.createElement("button");
                container.className = "vis blue";
                container.innerHTML = "Update";
                var edt = function(element){
                    return function(){
                        postInput(parameters,element, type,'UPDATE');
                        return false;
                    };
                }(type == 'AS'|| type == 'IS' ? row.parentNode :row)
                container.onclick = edt;

                div.appendChild(container);
            }
            if(response.action.DELETE){
                var container = document.createElement("button");
                container.className = "vis red";
                container.innerHTML = "Delete";
                var dlt = function(element){
                    return function(){
                        postInput(parameters,element, type,'DELETE');
                        return false;
                    };
                }(type == 'AS'|| type == 'IS' ? row.parentNode :row);
                container.onclick = dlt;
                div.appendChild(container);
            }
        }
    }
}


