function selectContainer(mode, options, selected) {
    var container = document.createElement('select')
	Object.keys(options['VALUE']).forEach(function(i){
		if(mode && options['TITLE'][i] === 'N'){
			return
		}
		var option = document.createElement('option')
		option.value = options['VALUE'][i]
		option.label = options['LABEL'][i]
		option.title = options['TITLE'][i]
		option.selected =options['VALUE'][i] === selected ? true : false
		container.add(option)
	})
	container.addEventListener(
		'change',
		function(){
			this.style.color = this.options[container.selectedIndex].title == 'Y' ? 'black' : 'red'
		},
		true
	)
	container.dispatchEvent(new Event('change'))
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
        removeElement(id + '_original')
    }else{
        var block = document.body.appendChild(document.createElement('div'))
        block.id = id
        block.className = 'popup'

	    var container = block.appendChild(document.createElement('div'))
	    container.className = "shadow header"

	    var close = container.appendChild(document.createElement('div'))
	    container.appendChild(document.createElement('h2'))
	    close.className = 'close'
	    close.onclick = function(){
		    removeElement(id)
	    }

	    var body = block.appendChild(document.createElement('div'))
	    body.className = 'shadow body'
	    body.appendChild(document.createElement('div'))
	    body.appendChild(document.createElement('div')).style.maxHeight = 0.6 * window.innerHeight + 'px'
    }
    return block
}

function buildTable(response, type, parameters) {
    var table = document.createElement('table')

    table.className = response.table ? 'original' : 'flipped'
	table.id = type + '_' + table.className

	var rows = response.rows + 1 + (response.action.INSERT ? 1 : 0)
    var columns = Object.keys(response.field).length + (response.action.INSERT ||response.action.DELETE || response.action.UPDATE ? 1 : 0)
    if (!response.table) {
        columns = [rows + (response.action.DELETE || response.action.UPDATE ? 1 : 0), rows = columns][0]
    }
    var header = {}
    for (var i = (response.headers ? 0 : 1); i < rows; i++) {
        var row = table.insertRow(-1)
        for (var k = 0; k < columns; k++) {
            var key = (response.table ? k : i)
            var inkey = (response.table ? i : k)
            var cell = row.insertCell(k)
            if (key < response.columns) {
                if (inkey === 0) {
                    header[key] = response.field[key].charAt(0) + response.field[key].slice(1).replace('_', ' ').toLowerCase()
                    cell.appendChild(document.createElement('h4')).innerHTML = header[key]
                } else if ((inkey === response.rows + 1 && response.action.INSERT) || inkey < response.rows + 1) {
                    if (!(response.field[key] in response.ignore)) {
                        if (response.field[key] in  response.options) {
                            var input = selectContainer(response.table,
							                            response.options[response.field[key]],
                                                        inkey < response.rows + 1 ? response.content[response.field[key]][inkey - 1] : null)
                        } else if (response.field[key] === 'CONFIGURATION') {
                            var input = document.createElement('textarea')
                        } else {
                            var input = document.createElement('input')
                            input.type = response.field[key] === 'ENABLED' || response.field[key] === 'IS_ENABLED' || response.field[key] === 'ATTACHED'  ? 'checkbox' : 'text'
                        }
                        if (inkey < response.rows + 1) {
                            input.disabled = response.disabled.hasOwnProperty(response.field[key]) || !response.action.UPDATE
                            input.type === 'checkbox' ? input.checked = response.content[response.field[key]][inkey - 1] === 'Y' : input.value = response.content[response.field[key]][inkey - 1]
                        }
                        input.name = response.field[key]
                        cell.appendChild(input)
                    } else if (inkey > 0 && inkey < response.rows + 1) {
                        var container = cell.appendChild(document.createElement('div'))
                        if(!response.table){
                            var div  = cell.appendChild(document.createElement('div'))
                            var button = div.appendChild(document.createElement('button'))
                            button.innerHTML = 'Edit'
                            button.onclick = function (t){
                                return function(){
                                    show(type.charAt(0) + response.field[t].charAt(0),
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
                var controls = createControls(response.action, parameters, (response.table ? row : row.parentNode), type)
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