function selectContainer(options,description,selected){
    var container = document.createElement('select')
    for(var i in options){
        var option = document.createElement('option')
        option.value = options[i]
        option.label = description[i]
        option.selected = options[i] === selected ? true : false
        container.add(option)
    }
    return container
}

function createFrame(name,id){
    var container = document.createElement('div')
    container.innerHTML =
        '<div class="shadow tab_label" >' +
            '<div  class="closeSub" onClick="removePopup(\'' + id +'\')">' +
                '<div class="one" ></div>' +
                '<div class="two" ></div>' +
            '</div>' +
            '<h2 >' + name + '</h2>' +
        '</div>' +
         '<div class="shadow tab">' +
             '<div id="head"></div>' +
             '<div id="content"></div>' +
        '</div>'
   return container
}

function hostContainer(parameters,data,type){
    var container = document.createElement('table')
    for(var i = 0; i< data.rows; i++){
        var row = container.insertRow(i)
        var color = (data.content.IS_ENABLED[i] == 'Y' ? (data.content.ATTACHED[i] == 'Y' ? 'black' : 'grey' ) : 'red')
        for(var k in data.include){
            var cell = row.insertCell(-1)
            if(k == 'ATTACHED'){
                var input  = document.createElement('input')
                input.type = "checkbox"
                input.disabled = data.content.IS_ENABLED[i] != 'Y'
                input.checked = data.content[k][i] == 'Y'
                input.onclick = function(element){
                    return function(){
                        return postInput(parameters, element,type)
                    }
                }(row)
            } else if(k == 'HOSTID') {
                var input  = document.createElement('select')
                var option = document.createElement('option')
                option.value = data.content[k][i]
                option.label = data.content[k][i]
                input.disabled = true
                input.style.color = color
                input.add(option)
            }
            input.name = data.include[k]
            cell.appendChild(input)
        }
    }
    return container
}

function scheduleContainer(data,selected){
    var select = selectContainer(data.content.ID,data.content.DESCRIPTION,selected);
    select.onchange = function(){return getData('LE', null, select)}
    for(var i in select.options){
        for(var k = 0 ;k < data.rows ; k++){
            if(data.content.ID[k] == select.options[i].value){
                select.options[i].title = data.content.IS_ENABLED[k]
            }
        }
    }

    var container = document.createElement('table');
    container.innerHTML =
            '<tr >' +
                '<td ><h4 >Schedule :</h4></td>' +
                '<td ></td>' +
                '<td >' +
                    '<button class="blue" onClick="getData(\'SA\',\'Add Schedule\',null)">Add</button>' +
                    '<button class="blue" onClick="getData(\'SC\',\'Edit Schedule\', document.querySelector(\'#SH #head select\'))">Edit</button>' +
                '</td>' +
            '</tr>' +
            '<tr style="visibility: hidden">' +
                '<td ><h4 >Enabled :</h4></td>' +
                '<td ><input disabled id="schedule_state" type="checkbox" class="checkbox"></td>' +
                '<td ><button class="blue"  onClick="getData(\'EC\',\'Calendar\', null)">Exclusions</button>' +
                '</td>' +
            '</tr>'
    container.rows[0].cells[1].appendChild(select)
    return container;
}

function appForm(response,type,parameters){
    var table = document.createElement('table')
    table.id = 'popup'
    response.fields = response.include
    response.columns = Object.keys(response.include).length

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
                        'NAME' : 'Host Settings',
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
                    cell.innerHTML = 'Inherited from ' + response.content.APP_DESCRIPTION[0]
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
    if(type == 'IS' && response.content.SCHEDULE[0] == ''){
        for(var i in schedule.options){
            if(schedule.options[i].value == response.content.INHERITED_SCHEDULE[0]){
                schedule.options[i].selected = true
                schedule.options[i].label += ' (Inherited from ' + response.content.APP_DESCRIPTION[0] + ')'
            }
        }
    }

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

    if(document.getElementById(type + '_table') != null) {
        var table = document.getElementById(type + '_table')
        table.parentNode.removeChild(table)
    }
    var table = document.createElement('table')
    table.id = type + '_table'

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
    return table;
}

function buildHTML(row,cell,i,k,response,type,parameters){
    var controls = createControls(response.action,parameters,row,type)

    if( k < response.columns ){
        if (i === 0){
            var header = response.field[k].charAt(0) + response.field[k].slice(1).replace('_', ' ').toLowerCase();
            cell.innerHTML = '<h4>' + header + '</h4>'
        } else if((i === response.rows + 1 && response.action.INSERT) || i < response.rows + 1){
                if(response.field[k] in response.include){
                    if(response.field[k] in  response.options){
                        var input = selectContainer(response.options[response.field[k]]['VALUE'],
                                                    response.options[response.field[k]]['LABEL'],
                                                    i < response.rows + 1 ? response.content[response.field[k]][i-1] : null)
                    }else if (response.field[k] === 'CONFIG'){
                        var input = document.createElement('textarea')
                    } else {
                        var input = document.createElement('input')
                        input.type = response.field[k] === 'IS_ENABLED' ? 'checkbox' : 'text'
                    }
                    if(i < response.rows + 1){
                        input.disabled = response.disabled.hasOwnProperty(response.field[k])
                        input.type === 'checkbox' ? input.checked = response.content[response.field[k]][i-1] === 'Y' : input.value = response.content[response.field[k]][i-1]
                    }
                    input.name = response.field[k]
                    cell.appendChild(input);
                } else if(i > 0 && i < response.rows + 1) {
                    cell.innerHTML = response.content[response.field[k]][i-1]
                }
            }
    } else {
        if(i === response.rows + 1){
            cell.appendChild(controls['INSERT'])
        }else if(i > 0 && i < response.rows + 1){
            cell.appendChild(controls['UPDATE'])
            cell.appendChild(controls['DELETE'])
        }
    }
}

function createControls(actions,parameters,element,type){
    var controls = {}
    Object.keys(actions).forEach(function(k) {
        if (actions[k]) {
            controls[k] = document.createElement("button")
            controls[k].className = "vis " + (k === "DELETE" ? "red" : "blue")
            controls[k].innerHTML = k.charAt(0) + k.slice(1).toLowerCase()
            var act = function(element){
                return function(){
                    postInput(parameters,element, type,k)
                    return false
                }
            }(type == 'AS'|| type == 'IS' || type == 'CS' ? element.parentNode : element)
            controls[k].onclick = act
        } else {
            controls[k] = document.createElement('span')
        }
    })
    return controls
}


