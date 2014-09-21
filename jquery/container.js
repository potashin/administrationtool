function selectContainer(mode, options, selected) {
	var container = $('<select/>').on('change',function(){
										$(this).css({
											color : $(this).find(':selected').prop('title') === 'N' ? 'red' : 'black'
										})
									})
	Object.keys(options['VALUE']).forEach(function(i){
		if(mode && options['TITLE'][i] === 'N') return
		var option = $('<option/>',{
			value : options['VALUE'][i],
			label : options['LABEL'][i],
			title : options['TITLE'][i],
			selected : options['VALUE'][i] === selected
		})
		container.append(option)
	})
	container.trigger('change')
	return container
}

function createControls(actions, parameters, element, type) {
	var controls = {}
	Object.keys(actions).forEach(function (k) {
		if (actions[k]) {
			controls[k] = $('<input/>', {
				type : 'button',
				class : "vis",
				name : k ,
				value : k.charAt(0) + k.slice(1).toLowerCase() ,
				click : function (element) {
					return function(){
						postInput(parameters, element, type, k)
					}
				}(element)
			})
		}
	})
	return controls
}

function buildTable(data, type, parameters) {

	var table = $('<table/>',{
		class : data.table ? 'original' : 'flipped',
		id : type + '_' + (data.table ? 'original' : 'flipped')
	})
	var rows = data.rows + 1 + (data.action.INSERT ? 1 : 0)
	var columns = Object.keys(data.field).length + (data.action.INSERT || data.action.DELETE || data.action.UPDATE ? 1 : 0)
	if (!data.table) {
		columns = [rows, rows = columns][0]
	}
	var header = {}
	for (var i = (data.headers ? 0 : 1); i < rows; i++) {
		var row = $('<tr/>').appendTo(table)
		for (var k = 0; k < columns; k++) {
			var key = (data.table ? k : i)
			var inkey = (data.table ? i : k)
			var cell = $('<td/>').appendTo(row)
			if (key < data.columns) {
				if (inkey === 0) {
					header[key] = data.field[key].charAt(0) + data.field[key].slice(1).replace('_', ' ').toLowerCase()
					$('<h4/>',{ text : header[key]}).appendTo(cell)
				} else if ((inkey === data.rows + 1 && data.action.INSERT) || inkey < data.rows + 1) {
					if (!(data.field[key] in data.ignore)) {
						if (data.field[key] in  data.options) {
							var input = selectContainer(data.table,
								data.options[data.field[key]],
								inkey < data.rows + 1 ? data.content[data.field[key]][inkey - 1] : null)
						} else if (data.field[key] === 'CONFIGURATION') {
							var input = $('<textarea/>')
						} else {
							var input = $('<input/>',{
								type : data.field[key] === 'ENABLED' || data.field[key] === 'IS_ENABLED' || data.field[key] === 'ATTACHED'  ? 'checkbox' : 'text'
							})
						}
						if (inkey < data.rows + 1) {
							input.prop({ disabled : data.disabled.hasOwnProperty(data.field[key]) || !data.action.UPDATE })
							input.prop('type') === 'checkbox' ? input.prop({ checked : data.content[data.field[key]][inkey - 1] === 'Y' }) : input.val(data.content[data.field[key]][inkey - 1])
						}
						input.prop({'name' : data.field[key]})
						input.appendTo(cell)
					} else if (inkey > 0 && inkey < data.rows + 1) {
						var container = $('<div/>').appendTo(cell)
						if(!data.table){
							var div  = $('<div/>').appendTo(cell)
							var button = $('<button/>',{
								text : 'Edit',
								click : function (t){
									return function(){
										show(type.charAt(0) + data.field[t].charAt(0),
											header[t] + ' Attachment',
											JSON.stringify(parameters))
									}
								}(key)
							}).appendTo(div)
						}
						Object.keys(data.content[data.field[key]]).forEach(
							function(t){
								if(typeof  data.content[data.field[key]][t] === 'object'){
									if(data.content[data.field[key]][t][inkey - 1] != null){
										var span = $('<span/>',{
											'data-highlight' : t,
											'text' : data.content[data.field[key]][t][inkey - 1]
										}).appendTo(container)
									}
								}else{
									container.html(data.content[data.field[key]][inkey - 1])
								}
							}
						)
					}
					if(data.field[key] in data.hidden){
						var input = $('<input/>',{
							type : 'hidden',
							name : data.hidden[data.field[key]]
						}).appendTo(cell)
						if(data.content.hasOwnProperty(input.prop('name'))){
							input.prop({value : data.content[input.prop('name')][inkey - 1]})
						}
					}
				}
			} else {
				var controls = createControls(data.action, parameters, (data.table ? row : table), type)
				if (inkey === data.rows + 1) {
					if(data.action.INSERT) controls['INSERT'].appendTo(cell)
				} else if (inkey > 0 && inkey < data.rows + 1) {
					if(data.action.UPDATE) controls['UPDATE'].appendTo(cell)
					if(data.action.DELETE) controls['DELETE'].appendTo(cell)
				}
			}
		}
	}
	return table
}
