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
            controls[k] = document.createElement("input")
            controls[k].type = 'button'
            controls[k].className = "vis"
            controls[k].name = k
            controls[k].value = k.charAt(0) + k.slice(1).toLowerCase()
            controls[k].onclick = function (element) {
                return function () {
                    postInput(parameters, element, type, k)
                    return false
                }
            }(element)
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

function createPopup(id) {
    if(document.getElementById(id) != null) {
	    var block = document.getElementById(id)
        removeElement(id + '_table')
    }else{
        var block = document.body.appendChild(document.createElement('div'))
        block.id = id
        block.className = 'popup'
        block.innerHTML = '<div class="shadow header" >' +
            '<div  class="close" onClick="removeElement(\'' + id + '\')">' +
            '<div></div><div></div>' +
            '</div>' +
            '<h2 ></h2>' +
            '</div>' +
            '<div class="shadow body">' +
            '<div class="head"></div>' +
            '<div class="content" style="max-height: ' + 0.6*window.innerHeight+ 'px"></div>' +
            '</div>'
    }

    return block
}

function buildHeadArea(data, selected) {
    var select = selectContainer(data.content.ID, data.content.DESCRIPTION, selected);
    select.onchange = function () {
        return show('LE','Schedules & Events', select)
    }
    for (var i in select.options) {
        for (var k = 0; k < data.rows; k++) {
            if (data.content.ID[k] == select.options[i].value) {
                select.options[i].title = data.content.IS_ENABLED[k]
            }
        }
    }

    select.name = 'SCHEDULE'

    var container = document.createElement('table')
    container.innerHTML =
        '<tr >' +
            '<td ><h4 >Schedule :</h4></td>' +
            '<td ></td>' +
            '<td >' +
            '<button onClick="show(\'SA\',\'Add Schedule\',null)">Add</button>' +
            '<button onClick="show(\'EC\',\'Calendar\', null)">Exclusions</button>' +
            '</td>' +
            '</tr>' +
            '<tr >' +
            '<td ><h4 >Enabled :</h4></td>' +
            '<td ><input disabled type="checkbox"></td>' +
            '<td >' +
            '<button onClick="show(\'SC\',\'Edit Schedule\', document.querySelector(\'#LE .head select\'))">Edit</button>' +
            '<button onClick="show(\'LW\',\'Weekday Settings\', null)">Weekdays</button>' +
            '</td>' +
            '</tr>'
    container.rows[0].cells[1].appendChild(select)
    return container
}

function buildContentArea(mode, response, type, parameters) {
    var table = document.createElement('table')
    table.id = type + '_table'
    table.className = mode ? 'original' : 'flipped'

    var rows = response.rows + 2
    var columns = Object.keys(response.field).length + (response.action.INSERT ||response.action.DELETE || response.action.UPDATE ? 1 : 0)
    if (!mode) {
        columns = [rows - (response.action.DELETE || response.action.UPDATE ? 1 : 0), rows = columns][0]
    }
    var header = {}
    for (var i = (response.headers ? 0 : 1); i < rows; i++) {
        var row = table.insertRow(-1)
        for (var k = 0; k < columns; k++) {
            var key = (mode ? k : i)
            var inkey = (mode ? i : k)
            var cell = row.insertCell(k)
            if (key < response.columns) {
                if (inkey === 0) {
                    header[key] = response.field[key].charAt(0) + response.field[key].slice(1).replace('_', ' ').toLowerCase()
                    cell.appendChild(document.createElement('h4')).innerHTML = header[key]
                } else if ((inkey === response.rows + 1 && response.action.INSERT) || inkey < response.rows + 1) {
                    if (!(response.field[key] in response.ignore)) {
                        if (response.field[key] in  response.options) {
                            var input = selectContainer(response.options[response.field[key]]['VALUE'],
                                response.options[response.field[key]]['LABEL'],
                                inkey < response.rows + 1 ? response.content[response.field[key]][inkey - 1] : null)
                        } else if (response.field[key] === 'CONFIGURATION') {
                            var input = document.createElement('textarea')
                        } else {
                            var input = document.createElement('input')
                            input.type = response.field[key] === 'ENABLED' || response.field[key] === 'ATTACHED'  ? 'checkbox' : 'text'
                        }
                        if (inkey < response.rows + 1) {
                            input.disabled = response.disabled.hasOwnProperty(response.field[key]) || !response.action.UPDATE
                            input.type === 'checkbox' ? input.checked = response.content[response.field[key]][inkey - 1] === 'Y' : input.value = response.content[response.field[key]][inkey - 1]
                        }
                        input.name = response.field[key]
                        cell.appendChild(input)
                    } else if (inkey > 0 && inkey < response.rows + 1) {
                        var container = cell.appendChild(document.createElement('div'))
                        if(!mode){
                            var div  = cell.appendChild(document.createElement('div'))
                            var button = div.appendChild(document.createElement('button'))
                            button.innerHTML = 'Edit'
                            button.onclick = function (t){
                                return function(){
                                    return show(type.charAt(0) + response.field[t].charAt(0),
                                        header[t] + ' Attachment',
                                        JSON.stringify(parameters))
                                }
                            }(key)
                        }
                        Object.keys(response.content[response.field[key]]).forEach(
                            function(t){
                                if(typeof  response.content[response.field[key]][t] === 'object'){
                                    if(response.content[response.field[key]][t][inkey - 1] != null){
                                        var span = container.appendChild(document.createElement('span'))
                                        span.setAttribute('data-highlight',t)
                                        span.innerHTML = response.content[response.field[key]][t][inkey - 1]
                                    }
                                }else{
                                    container.innerHTML = response.content[response.field[key]][inkey - 1]
                                }
                            }
                        )
                    }
	                if(response.field[key] in response.hidden){
		                var input = cell.appendChild(document.createElement('input'))
		                input.type = 'hidden'
		                input.name = response.hidden[response.field[key]]
		                if(response.content.hasOwnProperty(input.name)){
			                input.value = response.content[input.name][inkey - 1]
		                }
	                }
                }
            } else {
                var controls = createControls(response.action, parameters, (mode ? row : row.parentNode), type)
                if (inkey === response.rows + 1) {
                    if(controls.hasOwnProperty('INSERT')) cell.appendChild(controls['INSERT'])
                } else if (inkey > 0 && inkey < response.rows + 1) {
                    if(controls.hasOwnProperty('UPDATE')) cell.appendChild(controls['UPDATE'])
                    if(controls.hasOwnProperty('DELETE')) cell.appendChild(controls['DELETE'])
                }
            }
        }
    }
    return table
}




