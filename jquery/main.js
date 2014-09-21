$(window).load(function(){
	$('.details').on('click', function(){
		$(this).next().slideToggle("slow")
	})
	$.each($('td[data-stamp="LAST_HEARTBEAT"]'), function(){
		$(this).html(correctDate($(this).html()))
	})
	$.each($('#main table tr'), function(key, row){
		var main = $(row).prop('id').split('-_-')
		$(row).find('td:last-of-type button').on('click',function(){
			notification.set("Loading . . . ")
			var parameters = {
				'HOST' : $(row).find('select').prop('value'),
				'APP_NAME' : main[0],
				'INSTANCE' : main[1],
				'COMMAND' :$(this).html()
			}
			$.ajax({
				type : 'POST',
				url : '/Remote/Execute/',
				contentType : "application/x-www-form-urlencoded",
				dataType: "text",
				data : "data=" + JSON.stringify(parameters)
			}).done(function(response){
				notification.set(response)
			})
		})
	})
	setInterval(function(){
		$.ajax({
			type : 'POST',
			url : '/Monitor/Execute/',
			dataType: "text"
		}).done(function(response){
			var data = JSON.parse(response)
			if(typeof data === 'string'){
				notification.set(response)
			} else{
				for(var i in data){
					$('#' + i + ' td[data-stamp="LAST_HEARTBEAT"]').html(correctDate(data[i]))
				}
			}
		})
	}, 15000)
})

function correctDate(date){
	var newDate
	if(date != ''){
		var hms = date.substring(10,19);
		var month = date.substring(5,7);
		var day = date.substring(8,10);
		var year = date.substring(0,4);
		switch(month){
			case "01":
				month = ' января '
				break
			case "02":
				month = ' февраля '
				break
			case "03":
				month = ' марта '
				break
			case "04":
				month = ' апреля '
				break
			case "05":
				month = ' мая '
				break
			case "06":
				month = ' июня '
				break
			case "07":
				month = ' июля '
				break
			case "08":
				month = ' августа '
				break
			case "09":
				month = ' сентября '
				break
			case "10":
				month = ' октября '
				break
			case "11":
				month = ' ноября '
				break
			case "12":
				month = ' декабря '
				break

		}
		switch(day){
			case "01":
				day = ' 1 '
				break
			case "02":
				day = ' 2 '
				break
			case "03":
				day = ' 3 '
				break
			case "04":
				day = ' 4 '
				break
			case "05":
				day = ' 5 '
				break
			case "06":
				day = ' 6 '
				break
			case "07":
				day = ' 7 '
				break
			case "08":
				day = ' 8 '
				break
			case "09":
				day = ' 9 '
				break
		}
		newDate = day + month + year + " в " + hms
	} else {
		newDate = 'Нет данных'
	}

	return newDate
}

function notification()
{
	this.timeOut = null
	this.element = null
	this.reload = false
	this.color
}

notification.prototype.remove = function(){
	this.element.remove()
	this.element = null
	if(this.reload){
		location.reload()
	}
}

notification.prototype.set = function (message){
	if(!this.element){
		this.element = $('<div/>',{class : 'notification'}).appendTo($('body'))
		this.timeOut = null
	}
	try{
		message = JSON.parse(message)
		this.color = 'red'
		this.reload = false
	}catch (e){
		this.color = 'white'
		this.reload = true
	} finally {
		this.element.fadeOut(0, function(element){
			return function(){
				element.element.css({'color' : element.color})
				element.element.html(message).fadeIn(500)
			}
		}(this))
		if(this.timeOut != null){
			clearTimeout(this.timeOut)
		}
		this.timeOut = setTimeout(
			function(element){
				return function(){
					element.remove()
				}
			}(this), 5000
		)
	}
}


function show(type, name, object){
	var parameters = {}
	if(object != null){
		if(typeof object === 'object' && object instanceof jQuery){
			parameters[object.prop('name')] = object.prop('value')
		}else if(typeof object === 'string'){
			parameters = JSON.parse(object)
		}
	}
	$.ajax({
		type : 'POST',
		url : '/Popup/' + (!name ? 'getHead' : 'getBody') + '/Type/' + type,
		contentType : "application/x-www-form-urlencoded",
		dataType: "text",
		data : !object ? null : "data=" + JSON.stringify(parameters)
	}).done(
		function(response){
			try{
				response = JSON.parse(response)

				if($('#' + type).length === 0){
					$('<div/>',{ id : type, class : 'popup'}).appendTo($('body'));
					$('<div/>',{ class : 'shadow header'}).appendTo($('#' + type))
					$('<div/>',{
						class : 'close',
						click : function(){
							$('#' + type).remove()
						}
					}).appendTo($('#' + type + ' .header'))
					$('<h2/>').appendTo($('#' + type + ' .header'))
					$('<div/>',{ class : 'shadow body'}).appendTo($('#' + type))
					$('<div/>').appendTo($('#' + type + ' .body'))
					$('<div/>').appendTo($('#' + type + ' .body')).css( 'max-height', (0.6 * $(window).innerHeight()) + 'px')
				}else{
					$('#' + type + '_original').remove()
				}

				var table = buildTable(response, type, parameters)
				if (!name ) {
					$('#' + type).css('display','none')
					$('#' + type + ' .body > div:first-child').append(table)
					customizeHead(type)
				} else {
					var width = response.table ? (response.columns + 1) * 11 : (response.rows + 2) * 20
					$('#' + type).css('display','block')
					$('#' + type + ' .body').css( {'width' : width + '%'})
					$('#' + type + ' .header').css( {'width' : name.length + 5 + '%'})
					$('#' + type + ' .header h2').html(name)
					$('#' + type + ' .body > div:last-child ').append(table)
					customizeBody(type,response,parameters)
				}
			}catch (e){
				notification.set(response)
			}

	})
}



function customizeHead(type){
	var table = $('#' + type + ' .body > div:first-child table')
	switch(type){
		case 'LE':
			var select = table.find('select').prop({
												name : 'SCHEDULE',
												disabled : false
											}).change(
												function () {
													show('LE','Schedules & Events', $(this))
												}
											)
											.trigger('change')
			$('<button/>',{
				text : 'Add',
				click : function(){
					show('SA','Add Schedule', null)
				}
			}).insertAfter(select)
			$('<button/>',{
				text : 'Edit',
				click : function(){
					show('SC','Edit Schedule', select)
				}
			}).insertAfter(select)
			break
		default : return
	}
}

function customizeBody(type, response,parameters){
	var table = $('#' + type + ' .body > div:last-child table')
	switch(type){
		case 'LE':
			var object = $('#' + type +' .body div:first-child select')
			$('#' + type +' .body div:first-child input').prop({checked : object.find(':selected').prop('title') === 'Y'})
			if( response.content.ACTUAL != null){
				Object.keys(response.content.ACTUAL).forEach(function(k) {
					if (response.content.ACTUAL[k]) {
						table.find('tr:nth-child(' + (k*1 + 2) + ') td:not(:last-child)').css({
							'background-color' : 'green'
						})
					}
				})
			}
			break
		case 'IS':
			var input = table.find('input[type="text"], textarea, div:empty, select[name="SCHEDULE"]')
			var text = 'Inherited from ' + response.content.APP_DESCRIPTION[0]
			$.each(input,function(){
				if ($(this).prop('type') === 'text' || $(this).prop('type') === 'textarea') {
					$(this).prop({'placeholder' : $(this).prop('value') == '' ? text : ''})
				} else if ($(this).prop('type') === 'select-one') {
					var selected = $(this).find('option[value="' + response.content.INHERITED_SCHEDULE[0] + '"]')
					selected.prop({label : selected.prop('label') + ' (' + response.content.APP_DESCRIPTION[0] + ')'})
				} else {
					$(this).html(text)
				}
			})
		case 'AS':
			$('<button/>',{
				text : 'Show',
				click : function(){
					show('LH', 'Host Settings', null)
				}
			}).appendTo(table.find('tr:nth-child(7) div:last-child'))
			$('<button/>',{
				text : 'Show',
				click : function(){
					show('ES','Event Settings', null)
				}
			}).appendTo(table.find('tr:nth-child(8) div:last-child'))
		case 'CS':
			var select = $('select[name=SCHEDULE]')
			$('<button/>',{
				text : 'Show',
				click : function(){
					show('LE', null, select)
				}
			}).insertAfter(select)
			$('<button/>',{
				text : 'Exclusions',
				click : function(){
					show('EC','Calendar', null)
				}
			}).insertAfter(select)
			break
		case 'AH':
		case 'IH':
			var input = table.find('input[type="checkbox"]')
			$.each(input,function(key){
				var color = (response.content.IS_ENABLED[key] == 'Y' ? (response.content.ATTACHED[key] == 'Y' ? 'black' : 'grey' ) : 'red')
				table.find('tr:nth-child(' + (key*1 + 1) + ')').css('color', color)
				$(this).prop({
					type : 'checkbox',
					class : '',
					disabled: response.content.IS_ENABLED[key] != 'Y',
					checked : response.content.ATTACHED[key] == 'Y'
				}).on('click',function (element) {
						return function () {
							postInput(parameters, element,type)
						}
					}($(this).parents('tr')))
			})
			break
		default : return
	}
}

function postInput(parameters,element,type,action){
	if(action === 'DELETE')
		if (!confirm("Это действие удалит эту запись и все с ней связанные. Продолжить ?")) return

	var viewParam = null

	if(Object.keys(parameters).length > 0) viewParam = JSON.stringify(parameters)

	if(parameters.hasOwnProperty('APP_NAME') && !parameters.hasOwnProperty('INSTANCEID'))
		parameters.INSTANCEID = null

	var parameters = collectInput(element,parameters)

	if(action != null) parameters.TYPE = action
	$.ajax({
		type : 'POST',
		url : '/Popup/Perform/Type/' + type,
		contentType : "application/x-www-form-urlencoded",
		dataType: "text",
		data : "data=" + JSON.stringify(parameters)
	}).done(function(response){
		if(typeof response !== 'object'){
			if (type == 'AS' || type == 'IS' || type == 'CS') location.reload()
			else show(type, $('#' + type + ' h2').html(), viewParam)
		} else {
			notification.set(response)
		}
	})
}

function collectInput(element,parameters){
	var p = {}
	for(var i in parameters){
		p[i] = parameters[i]
	}
	var inputs = element.find('input[name]:not([type=button]),textarea,select')
	$.each(inputs, function(){
		var value = $(this).prop('type') == 'checkbox' ? ( $(this).prop('checked') === true ? 'Y' : 'N' ) : $(this).prop('value')
		p[$(this).prop('name')] = value
	})
	return p
}

