function selectContainer(options, description, selected) {
    var container = document.createElement('select')
    for (var i in options) {
        var option = document.createElement('option')
        option.value = options[i]
        option.label = description[i]
        option.selected = options[i] === selected ? true : false
        container.add(option)
    }
    return container
}

function createControls(actions, parameters, element, type) {
    var controls = {}
    Object.keys(actions).forEach(function (k) {
        if (actions[k]) {
            controls[k] = document.createElement("button")
            controls[k].className = "vis " + (k === "DELETE" ? "red" : "blue")
            controls[k].innerHTML = k.charAt(0) + k.slice(1).toLowerCase()
            var act = function (element) {
                return function () {
                    postInput(parameters, element, type, k)
                    return false
                }
            }(element)
            controls[k].onclick = act
        } else {
            controls[k] = document.createElement('span')
        }
    })
    return controls
}

function removeElement(id){
    var block = document.getElementById(id)
    if(block != null) {
        block.parentNode.removeChild(block)
    }
}

function createPopup(name, id) {
    removeElement(id)
    var block = document.body.appendChild(document.createElement('div'))
    block.id = id
    block.className = 'popup'
    block.innerHTML = '<div class="shadow tab_label" >' +
                         '<div  class="close" onClick="removeElement(\'' + id + '\')">' +
                            '<div></div><div></div>' +
                         '</div>' +
                         '<h2 >' + name + '</h2>' +
                      '</div>' +
                      '<div class="shadow tab">' +
                         '<div id="head"></div>' +
                         '<div id="content" style="max-height: ' + 0.7*window.innerHeight+ 'px"></div>' +
                      '</div>'
    return block
}

function hostContainer(parameters, data, type) {
    var table = buildContentArea(true, data,type,parameters)
    for (var i = 0; i < data.rows; i++) {
        var color = (data.ignore.IS_ENABLED[i] == 'Y' ? (data.content.ATTACHED[i] == 'Y' ? 'black' : 'grey' ) : 'red')
        table.rows[i].cells[0].style.color = color
        var input = table.rows[i].querySelector('input[type="checkbox"]')
        input.disabled = data.ignore.IS_ENABLED[i] != 'Y'
        input.onclick = function (element) {
            return function () {
                 return postInput(parameters, element, type)
            }
        }(table.rows[i])
    }
    return table
}

function scheduleContainer(data, selected) {
    var select = selectContainer(data.content.ID, data.content.DESCRIPTION, selected);
    select.onchange = function () {
        return getData('LE', null, select)
    }
    for (var i in select.options) {
        for (var k = 0; k < data.rows; k++) {
            if (data.content.ID[k] == select.options[i].value) {
                select.options[i].title = data.content.IS_ENABLED[k]
            }
        }
    }

    var container = document.createElement('table')
    container.innerHTML =
        '<tr >' +
            '<td ><h4 >Schedule :</h4></td>' +
            '<td ></td>' +
            '<td >' +
            '<button class="blue" onClick="getData(\'SA\',\'Add Schedule\',null)">Add</button>' +
            '<button class="blue"  onClick="getData(\'EC\',\'Calendar\', null)">Exclusions</button>' +
            '</td>' +
            '</tr>' +
            '<tr style="visibility: hidden">' +
            '<td ><h4 >Enabled :</h4></td>' +
            '<td ><input disabled id="schedule_state" type="checkbox" class="checkbox"></td>' +
            '<td >' +
            '<button class="blue" onClick="getData(\'SC\',\'Edit Schedule\', document.querySelector(\'#SH #head select\'))">Edit</button>' +
            '<button class="blue"  onClick="getData(\'LW\',\'Weekday Settings\', null)">Weekdays</button>' +
            '</td>' +
            '</tr>'
    container.rows[0].cells[1].appendChild(select)
    return container
}

function flippedTable(response, type, parameters) {
    if (type == 'CS') parameters = {'APP_NAME': '', INSTANCEID: ''}
    var table = buildContentArea(false, response, type, parameters)
    table.id = 'popup'

    if (Object.keys(response.ignore).length > 0) {
        var attachments = {}
        if (!parameters.hasOwnProperty('INSTANCEID')) {
            attachments.Instances = {
                'CONTENT': {
                    'ENABLED': response.ignore.ENABLED_INSTANCES,
                    'DISABLED': response.ignore.DISABLED_INSTANCES
                },
                'ONCLICK': {
                    0: {
                        'TYPE': 'AI',
                        'NAME': 'Instance Attachment',
                        'VALUE': 'Edit'
                    }
                }
            }
        }
        attachments.Hosts = {
            'CONTENT': {
                'ENABLED': response.ignore.ENABLED_HOSTS,
                'DISABLED': response.ignore.DISABLED_HOSTS
            },
            'ONCLICK': {
                0: {
                    'TYPE': type.charAt(0) + 'H',
                    'NAME': 'Hosts Attachment',
                    'VALUE': 'Edit'
                },
                1: {
                    'TYPE': 'LH',
                    'NAME': 'Host Settings',
                    'VALUE': 'Show'
                }

            }
        }

        attachments.Events = {
            'CONTENT': {
                'ENABLED': response.ignore.ENABLED_EVENTS,
                'DISABLED': response.ignore.DISABLED_EVENTS
            },
            'ONCLICK': {
                0: {
                    'TYPE': type.charAt(0) + 'E',
                    'NAME': 'Event Mapping',
                    'VALUE': 'Edit'
                },
                1: {
                    'TYPE': 'ES',
                    'NAME': 'Events Settings',
                    'VALUE': 'Show'
                }
            }
        }
        for (var t in attachments) {
            var row = table.insertRow(-1)
            row.insertCell(0).innerHTML = '<h4>' + t + '</h4>'
            var cell = row.insertCell(-1)
            for (var y in attachments[t]) {
                var container = cell.appendChild(document.createElement('div'))
                for (var u in attachments[t][y]) {
                    if (y === 'ONCLICK') {
                        var input = container.appendChild(document.createElement('input'))
                        input.type = 'button'
                        input.value = attachments[t][y][u]['VALUE']
                        input.className = 'blue'
                        input.onclick = function (p) {
                            return function () {
                                getData(p['TYPE'], p['NAME'], JSON.stringify(parameters))
                            }
                        }(attachments[t][y][u])
                    } else {
                        if (attachments[t][y][u][0] != '') {
                            var element = container.appendChild(document.createElement('span'))
                            element.innerHTML = attachments[t][y][u][0]
                            element.style.color = u === 'DISABLED' ? 'red' : 'black'
                        }
                    }
                }
            }
        }

        if (type === 'IS') {
            var input = table.querySelectorAll('input[type=text],textarea,div:empty,select[name="SCHEDULE"]')
            var text = 'Inherited from ' + response.ignore.APP_DESCRIPTION[0]
            Object.keys(input).forEach(function (k) {
                if (input[k].type == 'text') {
                    input[k].placeholder = input[k].value == '' ? text : ''
                } else if (input[k].type == 'select-one') {
                    for (var i in input[k].options) {
                        if (input[k].options[i].value == response.ignore.INHERITED_SCHEDULE[0] &&
                                (response.content.SCHEDULE[0] == '' ||
                                 response.ignore.INHERITED_SCHEDULE[0] == response.content.SCHEDULE[0])
                           ){
                            input[k].options[i].selected = true
                            input[k].options[i].label += ' (' + response.ignore.APP_DESCRIPTION[0] + ')'
                        }
                    }
                } else {
                    input[k].innerHTML = text
                }
            })

        }
    }

    var button = document.createElement('input')
    var schedule = table.querySelector('select[name="SCHEDULE"]')
    button.type = 'button'
    button.value = 'Show'
    button.className = 'blue'
    button.onclick = function () {
        return getData('SH', 'Schedules & Events', schedule)
    }
    schedule.parentNode.appendChild(button)

    return table
}


function originalTable(response, type, parameters) {
    removeElement(type + '_table')
    var table = buildContentArea(true, response, type, parameters)
    table.id = type + '_table'
    return table
}

function buildContentArea(mode, response, type, parameters) {
    var table = document.createElement('table')
    var rows = response.rows + 2
    var columns = Object.keys(response.field).length + (response.action.INSERT ||response.action.DELETE || response.action.UPDATE ? 1 : 0)
    if (!mode) {
        columns = [rows - (response.action.DELETE || response.action.UPDATE ? 1 : 0), rows = columns][0]
    }
    for (var i = (response.headers ? 0 : 1); i < rows; i++) {
        var row = table.insertRow(-1)
        for (var k = 0; k < columns; k++) {
            var key = (mode ? k : i)
            var inkey = (mode ? i : k)
            var cell = row.insertCell(k)
            if (key < response.columns) {
                if (inkey === 0) {
                    var header = response.field[key].charAt(0) + response.field[key].slice(1).replace('_', ' ').toLowerCase()
                    cell.innerHTML = '<h4>' + header + '</h4>'
                } else if ((inkey === response.rows + 1 && response.action.INSERT) || inkey < response.rows + 1) {
                    if (response.field[key] in response.include) {
                        if (response.field[key] in  response.options) {
                            var input = selectContainer(response.options[response.field[key]]['VALUE'],
                                response.options[response.field[key]]['LABEL'],
                                inkey < response.rows + 1 ? response.content[response.field[key]][inkey - 1] : null)
                        } else if (response.field[key] === 'CONFIG') {
                            var input = document.createElement('textarea')
                        } else {
                            var input = document.createElement('input')
                            input.type = response.field[key] === 'IS_ENABLED' || response.field[key] === 'ATTACHED'  ? 'checkbox' : 'text'
                        }
                        if (inkey < response.rows + 1) {
                            input.disabled = response.disabled.hasOwnProperty(response.field[key]) || !response.action.UPDATE
                            input.type === 'checkbox' ? input.checked = response.content[response.field[key]][inkey - 1] === 'Y' : input.value = response.content[response.field[key]][inkey - 1]
                        }
                        input.name = response.field[key]
                        cell.appendChild(input)
                    } else if (inkey > 0 && inkey < response.rows + 1) {
                        cell.innerHTML = response.content[response.field[key]][inkey - 1]
                        if(response.field[key] in response.hidden){
                            var input = cell.appendChild(document.createElement('input'))
                            input.type = 'hidden'
                            input.name = response.hidden[response.field[key]]
                            input.value = response.ignore[input.name][inkey - 1]
                        }
                    }
                }
            } else {
                var controls = createControls(response.action, parameters, (mode ? row : row.parentNode), type)
                if (inkey === response.rows + 1) {
                    cell.appendChild(controls['INSERT'])
                } else if (inkey > 0 && inkey < response.rows + 1) {
                    cell.appendChild(controls['UPDATE'])
                    cell.appendChild(controls['DELETE'])
                }
            }
        }
    }
    return table
}




