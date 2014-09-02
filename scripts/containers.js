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

function createFrame(name,id){
    var container = document.createElement('div')
    container.innerHTML =
        '<div class="shadow tab_label" >' +
            '<div  class="close" onClick="removePopup(\'' + id +'\')">' +
                '<div></div><div></div>' +
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
        var color = (data.ignore.IS_ENABLED[i] == 'Y' ? (data.content.ATTACHED[i] == 'Y' ? 'black' : 'grey' ) : 'red')
        for(var k in data.include){
            var cell = row.insertCell(-1)
            if(k == 'ATTACHED'){
                var input  = document.createElement('input')
                input.type = "checkbox"
                input.disabled = data.ignore.IS_ENABLED[i] != 'Y'
                input.checked = data.content[k][i] == 'Y'
                input.onclick = function(element){
                    return function(){
                        return postInput(parameters, element,type)
                    }
                }(row)
            } else if(k == 'HOSTID') {
                var input  = document.createElement('input')
                input.type = 'hidden'
                input.value = data.content[k][i]
                cell.innerHTML = data.ignore['DESCRIPTION'][i]
                cell.style.color = color
            }
            input.name = k
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

function flippedTable(response,type,parameters){
    if(type == 'CS') parameters = {'APP_NAME': '',INSTANCEID: ''}
    var table = buildContentArea(false,response,type,parameters)
    table.id = 'popup'

    if(Object.keys(response.ignore).length > 0){
        var attachments = {}
        if(!parameters.hasOwnProperty('INSTANCEID')){
            attachments.Instances = {
                'CONTENT' : {
                    'ENABLED' : response.ignore.ENABLED_INSTANCES,
                    'DISABLED' : response.ignore.DISABLED_INSTANCES
                },
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
            'CONTENT' : {
                'ENABLED' : response.ignore.ENABLED_HOSTS,
                'DISABLED' : response.ignore.DISABLED_HOSTS
            },
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
            'CONTENT' : {
                'ENABLED' : response.ignore.ENABLED_EVENTS,
                'DISABLED' : response.ignore.DISABLED_EVENTS
            },
            'ONCLICK' : {
                0 : {
                    'TYPE' : type.charAt(0) + 'E',
                    'NAME' : 'Event Mapping',
                    'VALUE' : 'Edit'
                }
            }
        }
        for (var t in attachments){
            var row = table.insertRow(-1)
            row.insertCell(0).innerHTML = '<h4>' + t + '</h4>'
            var cell = row.insertCell(-1)
            for(var y in attachments[t]){
                var container = cell.appendChild(document.createElement('div'))
                for(var u in attachments[t][y]){
                    if(y === 'ONCLICK'){
                        var input = container.appendChild(document.createElement('input'))
                        input.type = 'button'
                        input.value = attachments[t][y][u]['VALUE']
                        input.className = 'blue'
                        input.onclick = function(p){
                            return function(){
                                getData(p['TYPE'],p['NAME'],JSON.stringify(parameters))
                            }
                        }(attachments[t][y][u])
                    }else {
                        if(attachments[t][y][u][0] != ''){
                            var element = container.appendChild(document.createElement('span'))
                            element.innerHTML = attachments[t][y][u][0]
                            element.style.color = u === 'DISABLED' ? 'red' : 'black'
                        }
                    }
                }
            }
        }

        if(type === 'IS'){
            var input = table.querySelectorAll('input[type=text],textarea,div:empty')
            var text = 'Inherited from ' + response.ignore.APP_DESCRIPTION[0]
            Object.keys(input).forEach(function(k) {
                input[k].placeholder = input[k].value == '' ? text : ''
                input[k].innerHTML = text
            })

    }

    var button = document.createElement('input')
    var schedule = table.querySelector('select[name="SCHEDULE"]')

    if(type == 'IS' && response.content.SCHEDULE[0] == ''){
        for(var i in schedule.options){
            if(schedule.options[i].value == response.ignore.INHERITED_SCHEDULE[0]){
                schedule.options[i].selected = true
                schedule.options[i].label += ' (' + response.ignore.APP_DESCRIPTION[0] + ')'
            }
        }
    }

    button.type = 'button'
    button.value = 'Show'
    button.className = 'blue'
    button.onclick = function(){
        return getData('SH', 'Schedules & Events', schedule)
    }
    schedule.parentNode.appendChild(button)}

    return table;
}


function originalTable(response,type,parameters){
    if(document.getElementById(type + '_table') != null) {
        var table = document.getElementById(type + '_table')
        table.parentNode.removeChild(table)
    }
    var table = buildContentArea(true,response,type,parameters)
    table.id = type + '_table'
    return table;
}

function buildContentArea(mode,response,type,parameters){
    var table = document.createElement('table')
    var rows = response.rows + 1
    var columns = Object.keys(response.include).length
    if(!mode){
        columns = [rows, rows = columns][0]
    }
    for(var i = 0;i < rows + 1; i++){
        var row = table.insertRow(-1)
        for(var k = 0;k < columns + 1 ; k++){
            var key = (mode ? k : i)
            var inkey = (mode ? i : k)
            var cell = row.insertCell(k)
            if( key < response.columns ){
                if (inkey === 0){
                    var header = response.field[key].charAt(0) + response.field[key].slice(1).replace('_', ' ').toLowerCase();
                    cell.innerHTML = '<h4>' + header + '</h4>'
                } else if((inkey === response.rows + 1 && response.action.INSERT) || inkey < response.rows + 1){
                    if(response.field[key] in response.include){
                        if(response.field[key] in  response.options){
                            var input = selectContainer(response.options[response.field[key]]['VALUE'],
                                response.options[response.field[key]]['LABEL'],
                                inkey < response.rows + 1 ? response.content[response.field[key]][inkey - 1] : null)
                        }else if (response.field[key] === 'CONFIG'){
                            var input = document.createElement('textarea')
                        } else {
                            var input = document.createElement('input')
                            input.type = response.field[key] === 'IS_ENABLED' ? 'checkbox' : 'text'
                        }
                        if(inkey < response.rows + 1){
                            input.disabled = response.disabled.hasOwnProperty(response.field[key])
                            input.type === 'checkbox' ? input.checked = response.content[response.field[key]][inkey - 1] === 'Y' : input.value = response.content[response.field[key]][inkey - 1]
                        }
                        input.name = response.field[key]
                        cell.appendChild(input);
                    } else if(inkey > 0 && inkey < response.rows + 1) {
                        cell.innerHTML = response.content[response.field[key]][inkey - 1]
                    }
                }
            } else {
                var controls = createControls(response.action,parameters,row,type)
                if(inkey === response.rows + 1){
                    cell.appendChild(controls['INSERT'])
                }else if(inkey > 0 && inkey < response.rows + 1){
                    cell.appendChild(controls['UPDATE'])
                    cell.appendChild(controls['DELETE'])
                }
            }
        }
    }
    return table
}




