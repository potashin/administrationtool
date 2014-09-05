function getXmlHttp(){
    var xmlhttp
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (E) {
            xmlhttp = false
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
        try{
            xmlhttp = new XMLHttpRequest()
        } catch (e){
            xmlhttp = false
        }
    }
    return xmlhttp
}

function doSSH(app,id){
    var row = document.getElementById(app + '_' + id)
    var xmlhttp = getXmlHttp()
    var parameters = {
        'HOST' : row.querySelector('select').value,
        'APP_NAME' : app,
        'INSTANCE' : row.querySelector('button').innerHTML,
        'COMMAND' : row.querySelector('button[class="blue"]').innerHTML
    }
    var json = JSON.stringify(parameters)
    var par = "data="+encodeURIComponent(json)
    notification.set("Loading . . . ")
    xmlhttp.open('POST','/Remote/Execute/', true)
    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState == 4){
         if(xmlhttp.status == 200){
             notification.set(xmlhttp.responseText)
         }
        }
      }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xmlhttp.send(par)
}

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
    this.class = 'notification'
    this.timeOut = null
    this.element = null
}

notification.prototype.remove = function(){
    this.element.parentNode.removeChild(this.element)
    this.element = null
}

notification.prototype.set = function (message){
    if(this.element == null){
        this.element = document.body.appendChild(document.createElement('div'))
        this.timeOut = null
        this.element.className = this.class
    }
    try{
        message = JSON.parse(message)
        this.element.style.color = 'red'
    }catch (e){
        this.element.style.color = 'white'
    } finally {
        this.element.innerHTML = message
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

function customizeTable(table,type, response){
    switch(type){
        case 'LE':
            var object = document.querySelector('#' + type +' .head select')
            document.querySelector('#' + type +' .head input').checked = object.options[object.selectedIndex].title == 'Y'
            if( response.content.ACTUAL != null){
                Object.keys(response.content.ACTUAL).forEach(function(k) {
                    if (response.content.ACTUAL[k]) {
                        k++
                        for(var i = 0 ;i < response.columns ; i++){
                            table.rows[k].cells[i].bgColor = 'green'
                        }
                    }
                })
            }
            break
	    case 'IS':
		    var input = table.querySelectorAll('input[type=text],textarea,div:empty,select[name="SCHEDULE"]')
		    var text = 'Inherited from ' + response.content.APP_DESCRIPTION[0]
		    Object.keys(input).forEach(function (k) {
			    if (input[k].type == 'text' || input[k].type == 'textarea') {
				    input[k].placeholder = input[k].value == '' ? text : ''
			    } else if (input[k].type == 'select-one') {
				    for (var i in input[k].options) {
					    if (input[k].options[i].value == response.content.INHERITED_SCHEDULE[0] &&
						    (response.content.SCHEDULE[0] == '' ||
							    response.content.INHERITED_SCHEDULE[0] == response.content.SCHEDULE[0])
						    ){
						    input[k].options[i].selected = true
						    input[k].options[i].label += ' (' + response.content.APP_DESCRIPTION[0] + ')'
					    }
				    }
			    } else {
				    input[k].innerHTML = text
			    }
		    })
	    case 'AS':
	    case 'CS':
		    var button = document.createElement('button')
		    var schedule = table.querySelector('select[name="SCHEDULE"]')
		    button.innerHTML = 'Show'
		    button.onclick = function () {
			    return show('LE', null, null)
		    }
		    schedule.parentNode.appendChild(button)
		    break
        case 'AH':
        case 'IH':
            for (var i = 0; i < response.rows; i++) {
                var color = (response.content.IS_ENABLED[i] == 'Y' ? (response.content.ATTACHED[i] == 'Y' ? 'black' : 'grey' ) : 'red')
                table.rows[i].cells[0].style.color = color
                var input = table.rows[i].querySelector('input[type="button"]')
                input.type = 'checkbox'
                input.className = ''
                input.checked = response.content.ATTACHED[i] == 'Y'
                input.disabled = response.content.IS_ENABLED[i] != 'Y'
                /*input.onclick = function (element) {
	                 return function () {
	                    return postInput(parameters, element, type)
	                 }
                 }(table.rows[i])*/

            }
            break
        default : return
    }
}

function show(type,name,object){
    var parameters = {}
    var post = null
    if(object != null && typeof object === 'object' && object.nodeName){
        parameters[object.name] = object.value
    } else if (typeof object === 'string'){
        parameters = JSON.parse(object)
    }

    if(Object.keys(parameters).length > 0){
        var json = JSON.stringify(parameters)
        post = "data=" + encodeURIComponent(json)
	    var affix = name.replace(/ /g,'')
	    Object.keys(parameters).forEach(
		    function(k){
			    affix += '/' + parameters[k]
		    }
	    )
    }
    var xmlhttp = getXmlHttp()
    xmlhttp.open('POST', '/Popup/Show/Type/' + type,true)
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText
                try{
                    var response = JSON.parse(json)
                    var block = createPopup(type)
                    if (!name ) {
                        var table = buildHeadArea(response,document.querySelector('select[name=SCHEDULE]').value)
	                    document.querySelector('#' + type + ' .head').appendChild(table)
	                    table.querySelector('select').onchange()
                    } else {
	                    location.hash = affix
	                    var table = buildContentArea(response.table, response, type, parameters)
                        var width = response.table ? (response.columns + 1) * 11 : (response.rows + 2) * 20
	                    block.querySelector('#' + type + ' .body').style.width = width + '%'
	                    block.querySelector('#' + type + ' .header').style.width = name.length + 5 + '%'
	                    block.querySelector('#' + type + ' .header h2').innerHTML = name

	                    customizeTable(table,type,response)
	                    
	                    document.querySelector('#' + type + ' .content').appendChild(table)
                    }
                }catch(e){
                   notification.set(json)
                }
            }
        }
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xmlhttp.send(post)
}

function collectInput(element,parameters){
    var p = {}
    for(var i in parameters){
        p[i] = parameters[i]
    }
    var input = element.querySelectorAll('input[name]:not([type=button]),textarea,select')
    for(var i = 0; i < input.length ; i++){
        var value = input[i].type == 'checkbox' ? ( input[i].checked === true ? 'Y' : 'N' ) : input[i].value
        p[input[i].name] = value
    }
    return p

}

function postInput(parameters,element,type,action){
    if(action === 'DELETE'){
        if (!confirm("Это действие удалит эту запись и все с ней связанные. Продолжить ?")) {
          return
        }
    }

    var viewParam = {}

    if(Object.keys(parameters).length > 0){
        Object.keys(parameters).forEach(function(k){
            viewParam[k] = parameters[k]
        })
        viewParam = JSON.stringify(viewParam)
    }else{
        viewParam = null
    }
    if(parameters.hasOwnProperty('APP_NAME') && !parameters.hasOwnProperty('INSTANCEID')){
        parameters.INSTANCEID = null
    }

    var parameters = collectInput(element,parameters)
    if(action != null){
        parameters.TYPE = action
    }

    var json = JSON.stringify(parameters)
    var par = "data=" + encodeURIComponent(json)
    var xmlhttp = getXmlHttp()
    xmlhttp.open('POST','/Popup/Perform/Type/' + type, true)
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState == 4){
            if(xmlhttp.status == 200){
                var json = xmlhttp.responseText
                if(json == ''){
                    if(type == 'LE'){
                        show(type, null, document.querySelector('#LE .head select'))
                    }else if (type == 'AS' || type == 'IS'){
                        location.reload()
                    }else{
                        show(type, document.querySelector('#' + type + ' h2').innerHTML, viewParam)
                    }
                } else {
                    notification.set(json)
                }
            }
        }
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xmlhttp.send(par)
}

function showDetails(element){
    var style = element.style.display
    element.style.display = (style == 'none' || style == '') ? 'table' : 'none'
}

function getHeartBeat(){
    var xmlhttp = getXmlHttp()
    xmlhttp.open('POST','/Monitor/Execute/', true)
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState == 4){
            if(xmlhttp.status == 200){
                var json = xmlhttp.responseText
                try{
                    var response = JSON.parse(json)
                    for(var i in response){
                        var cell = document.querySelector('#' + i + ' td[data-stamp="LAST_HEARTBEAT"]')
                        cell.innerHTML = correctDate(response[i])
                    }
                }catch (e){
                    var ee = new notification()
                    ee.set(xmlhttp.responseText)
                }
            }
        }
    }
    xmlhttp.send(null)
}