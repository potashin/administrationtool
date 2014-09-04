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
           function(object){
              return function(){
                   object.remove()
               }
           }(this), 5000
        )
    }
}

function getData(type,name,object){
    var parameters = {}
    var post = null
    switch(type){
        case 'IH' :
        case 'IE' :
        case 'AH' :
        case 'AE' :
        case 'IS' :
        case 'AS' :
        case 'AI' : object = JSON.parse(object)
                    parameters = object
                    break
        case 'SC' :
        case 'LE' : parameters.SCHEDULE = object.value
                    break

        default : parameters = {}
    }

    var xmlhttp = getXmlHttp()
    var affix = 'Popup/Show/Type/'
    xmlhttp.open('POST', '/' + affix  + type,true)
    if(Object.keys(parameters).length > 0){
        var json = JSON.stringify(parameters)
        post = "data=" + encodeURIComponent(json)
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText
                /*try{*/
                    var response = JSON.parse(json)
                    if(type == 'LE'){
                        document.querySelector('#SH #head table tr:nth-child(2)').style.visibility = 'visible'
                        document.getElementById('schedule_state').checked = object.options[object.selectedIndex].title == 'Y'
                        var content = document.querySelector('#SH #content')
                        var table = originalTable(response,type,parameters)
                        if( response.ignore.ACTUAL != null){
                            Object.keys(response.ignore.ACTUAL).forEach(function(k) {
                                if (response.ignore.ACTUAL[k]) {
                                    k++
                                    for(var i = 0 ;i < response.columns ; i++){
                                        table.rows[k].cells[i].bgColor = 'green'
                                    }
                                }
                            })
                        }
                        content.appendChild(table)
                    }else{
                        location.hash = affix + name.replace(/ /g, '')
                        var block = createPopup(name,type)
                        var content = document.querySelector('#' + type + ' #content')
                        var head = document.querySelector('#' + type + ' #head')
                        var table
                        if (type == 'SH') {
                            table = scheduleContainer(response,object.value)
                            head.appendChild(table)
                            getData('LE',null,head.querySelector('select'))
                            width = table.rows[0].cells.length * 15
                        }else{
                            var width
                            switch(type){
                                case 'AS':
                                case 'IS':
                                case 'CS':  table = flippedTable(response,type,parameters)
                                            width = table.rows[0].cells.length * 30
                                            break
                                case 'AH':
                                case 'IH':  //table = originalTable(response,type,parameters)
                                            table = hostContainer(parameters,response,type)
                                            width = table.rows[0].cells.length * 15
                                            break
                                default :   table = originalTable(response,type,parameters)
                                            width = table.rows[0].cells.length * 11
                            }
                            content.appendChild(table)
                        }

                        block.querySelector('.tab').style.width = width + '%'
                        block.querySelector('.tab_label').style.width = name.length + 5 + '%'
                    }

               /* }catch(e){
                   notification.set(json)
                }*/
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
    var input = element.querySelectorAll('input[name],textarea,select')
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
                        getData(type, null, document.querySelector('#SH head select'))
                    }else if (type == 'AS' || type == 'IS'){
                        location.reload()
                    }else{
                        getData(type, document.querySelector('#' + type + ' h2').innerHTML, viewParam)
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


