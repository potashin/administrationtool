function getXmlHttp(){
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
        try{
            xmlhttp = new XMLHttpRequest();
        } catch (e){
            xmlhttp = false;
        }
    }
    return xmlhttp;
}

function doSSH(id,app)
{
    var row = document.getElementById(id);
    var xmlhttp = getXmlHttp();
    var parameters = {
        'HOST' : row.querySelector('select').value,
        'APP_NAME' : app,
        'INSTANCE' : row.querySelector('a').innerHTML,
        'COMMAND' : row.querySelector('button').innerHTML
    };
    var json = JSON.stringify(parameters);
    var par = "data="+encodeURIComponent(json);
    var ee = document.getElementById("error");
    ee.style.color = "white";
    ee.innerHTML = "Loading...";
    ee.style.display = "block";
    xmlhttp.open('POST','http://administrating/Remote/Execute/', true);
    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState == 4){
         if(xmlhttp.status == 200){
             closeMsg(xmlhttp.responseText,'black');
         }
        }
      };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);
}

function correctAllDates(){
    var td = document.querySelectorAll('td[data-stamp="LAST_HEARTBEAT"]')
    for(var q = 0;q < td.length;q++){
        if( td[q].innerHTML != "Нет данных"){
            td[q].innerHTML = correctDate(td[q].innerHTML)
        }
    }
}

function correctDate(date){
    var hms = date.substring(10,19);
    var month = date.substring(5,7);
    var day = date.substring(8,10);
    var year = date.substring(0,4);
    switch(month){
        case "01":month = ' января ';break;
        case "02":month = ' февраля ';break;
        case "03":month = ' марта ';break;
        case "04":month = ' апреля ';break;
        case "05":month = ' мая ';break;
        case "06":month = ' июня ';break;
        case "07":month = ' июля ';break;
        case "08":month = ' августа ';break;
        case "09":month = ' сентября ';break;
        case "10":month = ' октября ';break;
        case "11":month = ' ноября ';break;
        case "12":month = ' декабря ';break;

    }
    switch(day){
        case "01":day = ' 1 ';break;
        case "02":day = ' 2 ';break;
        case "03":day = ' 3 ';break;
        case "04":day = ' 4 ';break;
        case "05":day = ' 5 ';break;
        case "06":day = ' 6 ';break;
        case "07":day = ' 7 ';break;
        case "08":day = ' 8 ';break;
        case "09":day = ' 9 ';break;
    }
    var newDate = day+month+year+" в "+hms;
    return newDate;
}

function closeMsg(message,color)
{
    var ee = document.getElementById("error")
    ee.innerHTML = message
    ee.color = color
    ee.style.display = "block"

    setTimeout(
        function(){
            document.getElementById('error').style.display='none';
        },5000
    )
}

function createPopup(id){
    if(document.getElementById(id) != null) {
        var block = document.getElementById(id)
        block.parentNode.removeChild(block);
    }
    var block = document.body.appendChild(document.createElement('div'));
    block.id = id
    block.style.display = 'table'
    return block
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
    var affix = 'Popup/Show/Type/';
    xmlhttp.open('POST', 'http://administrating/' + affix  + type,true)
    if(Object.keys(parameters).length > 0){
        var json = JSON.stringify(parameters)
        post = "data=" + encodeURIComponent(json)
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                    if(type == 'AS' || type == 'IS' || type == 'CS'){
                        var block = createPopup('popup')
                        var frame = createFrame(name,'popup')
                        block.appendChild(frame)
                        var content = document.getElementById('popup_content')
                        var table = appForm(response,type,parameters)
                        location.hash = affix + name.replace(/ /g, '')
                        content.appendChild(table)
                    }else if(type != 'LE'){
                        location.hash = affix + name.replace(/ /g, '')
                        var block = createPopup('Subsidiary')
                        var frame = createFrame(name,'Subsidiary')
                        block.appendChild(frame)
                        var table
                        var content = document.getElementById('Subsidiary_content')
                        var head = document.getElementById('Subsidiary_head')
                        if(type == 'SH') {
                            table = scheduleContainer(response,object.value)
                            head.appendChild(table)
                            getData('LE',null,head.querySelector('select'))

                        } else if (type == 'AH' || type == 'IH') {
                            table = hostContainer(parameters,response,type)
                            content.appendChild(table)
                        }else {
                            table = createTable(response,type,parameters)
                            content.appendChild(table)
                        }
                    }else {
                        var head = document.getElementById('Subsidiary_head')
                        head.children[0].children[1].style.display = 'block'
                        document.getElementById('schedule_state').checked = object.options[object.selectedIndex].title == "Y" ? true : false
                        var content = document.getElementById('Subsidiary_content')
                        var table = createTable(response,type,parameters)
                        content.appendChild(table)
                    }
                }catch(e){
                    closeMsg(json,'red');
                }
            }
        }
    };
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
        var value = input[i].name == 'IS_ENABLED' ? ( input[i].checked === true ? 'Y' : 'N' ) : input[i].value
        p[input[i].name] = value
    }
    return p

}

function postInput(parameters,element,type,action){
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
    var input
    if(input = element.querySelector('input[name=TYPE]')){
        input.value = action
    }

    var parameters = collectInput(element,parameters)
    var json = JSON.stringify(parameters);
    var par = "data=" + encodeURIComponent(json);
    var xmlhttp = getXmlHttp();
    xmlhttp.open('POST','http://administrating/Popup/Perform/Type/' + type, true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState == 4){
            if(xmlhttp.status == 200){
                var json = xmlhttp.responseText
                try{
                    if(json == ''){
                        if(type == 'LE'){
                            getData(type, document.querySelector('#Subsidiary h2').innerHTML, document.querySelector('#Subsidiary_head select'))
                        }else if(type != 'AS' && type != 'IS' && type != 'AH' && type != 'IH'){
                            getData(type, document.getElementById('Subsidiary').children[0].id, viewParam)
                        } else if (type == 'AS' || type == 'IS'){
                            location.reload()
                        }

                    }else {
                        throw 'Error'
                    }
                }catch(e){
                    closeMsg(json,'red');
                }
            }
        }
    };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);
}

function showDetails(element){
    element.style.display = (element.style.display == 'none' || element.style.display == '') ? 'block' : 'none';
}

/*function enableInput(parameters,element,type,action){
 var p = {}
 var button = element.querySelector('button[class*=blue]')
 for(var i in parameters){
 p[i] = parameters[i]
 }
 button.innerHTML = "Update"

 var edt = function(){
 return postInput(p,element,type,action)
 }
 button.onclick = edt
 var input = element.querySelectorAll('input[name],textarea,select')
 for(var i = 0; i < input.length;i++){
 input[i].disabled = false
 }

 }


/*function saveChanges(type,name){
    var table = document.getElementById("popup").getElementsByTagName("table")[0];
    var info = {};
    var columns = table.rows[0].cells.length-1 ;
    var inputRow = table.rows[table.rows.length-1];
    for(var i = 0;i<columns;i++){
        if(table.rows[0].cells[i].innerHTML == 'IS_ENABLED') {
            var state = inputRow.cells[i].children[0].children[0].checked;
            info[table.rows[0].cells[i].innerHTML] = state == true ? 'Y' : 'N';
        } else{
            info[table.rows[0].cells[i].innerHTML] = inputRow.cells[i].children[0].children[0].value;
        }
    }
    var json = JSON.stringify(info);
    var par = "data="+encodeURIComponent(json);
    var url = 'http://administrating/Popup/Insert/Target/' + type.toUpperCase();
    var xmlhttp = getXmlHttp();
    xmlhttp.open('POST',url,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var error = xmlhttp.responseText;
                if(error==""){
                    getData(type,name);
                }else{
                    var ee = document.getElementById("error");
                    ee.innerHTML = error;
                    ee.style.display = "block";
                    ee.style.color = "red";
                    closeMsg();
                }
            }
        }
    };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);

}

/*function deleteRow(number,type,name){
    var table = document.getElementById("popup").getElementsByTagName("table")[0];
    var info = {};
    for(var i = 0;i<table.rows[number].cells.length-1;i++){
        if(table.rows[0].cells[i].innerHTML == 'IS_ENABLED') {
            var state = table.rows[number].cells[i].children[0].children[0].checked;
            info[table.rows[0].cells[i].innerHTML] = state == true ? 'Y' : 'N';
        } else{
            info[table.rows[0].cells[i].innerHTML] = table.rows[number].cells[i].innerHTML;
        }
    }
    var json = JSON.stringify(info);
    var par = "data="+encodeURIComponent(json);
    var xmlhttp = getXmlHttp();
    var url = 'http://administrating/Popup/Delete/Target/' + type.toUpperCase();
    xmlhttp.open('POST', url ,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var error = xmlhttp.responseText;
                if(error==""){
                    getData(type,name);
                }else{
                    var ee = document.getElementById("error");
                    ee.innerHTML = error;
                    ee.style.display = "block";
                    ee.style.color = "red";
                    closeMsg();
                }
            }
        }
    };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);

}
function editPushed(number,type,name){
    var table = document.querySelector('table#content_table');
    var info = {};
    var input = table.rows[number].querySelectorAll('input, select')
    for(var i = 0; i < input.length ; i++){
        if(input[i].type == 'checkbox') {
            info['BEFORE_' + table.rows[0].cells[i].innerHTML] = (input[i].checked === true ? 'Y' : 'N')
        } else {
            info['BEFORE_' + table.rows[0].cells[i].innerHTML] = input[i].value
        }
        input[i].disabled = false
    }
    var container = document.createElement("button");
    container.className = "classname vis blue";
    container.innerHTML = "Save";
    var edt = function(){
        edit(number,type,info,name);
        return false;
    };
    container.onclick = edt
    table.rows[number].cells[input.length].querySelector('div').style.display = 'none'
    table.rows[number].cells[input.length].appendChild(container);
}



function edit(number,type,before,name){
    var table = document.querySelector('table#content_table');
    var after = {};
    var input = table.rows[number].querySelectorAll('input, select, textarea')
    for(var i = 0; i < input.length ; i++){
        if(input[i].type == 'checkbox') {
            after['AFTER_' + table.rows[0].cells[i].innerHTML] = (input[i].checked === true ? 'Y' : 'N')
        } else {
            after['AFTER_' + table.rows[0].cells[i].innerHTML] = input[i].value
        }
    }
    for (var key in before){
        after[key] = before[key];
    }
    var json = JSON.stringify(after);
    var par = "data=" + encodeURIComponent(json);
    var xmlhttp = getXmlHttp();
    var url = 'http://administrating/';
    xmlhttp.open('POST', url ,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                    table.rows[number].cells[input.length].removeChild(table.rows[number].cells[input.length].querySelector('button'))
                    table.rows[number].cells[input.length].querySelector('div').style.display = 'block'
                    /*for(var i = 0;i<table.rows[number].cells.length;i++){
                        var cell = table.rows[number].cells[i];
                        if(i==table.rows[number].cells.length-1){
                            var child = cell.children[0];
                            cell.removeChild(child);
                            var div = cell.appendChild(document.createElement("div"));
                            var container = document.createElement("button");
                            container.className = "classname vis blue";
                            container.innerHTML = "Edit";
                            var edt = function(){
                                editPushed(number,type,name);
                                return false;
                            };
                            container.onclick = edt;
                            div.appendChild(container);
                            var container = document.createElement("button");
                            container.className = "classname vis red";
                            container.innerHTML = "Delete";
                            var dlt = function(){
                                deleteRow(number,type,name);
                                return false;
                            };
                            container.onclick = dlt;
                            div.appendChild(container);
                        }else{
                            var cur_field = table.rows[0].cells[i].innerHTML;

                            for(var q in response.field){
                                if(response.field[q] === cur_field){
                                    var child = cell.children[0];
                                    cell.removeChild(child);
                                    if(response.field[q] == 'IS_ENABLED'){
                                        var option = cell.appendChild(document.createElement("div"));
                                        var check = document.createElement("input");
                                        check.type = 'checkbox';
                                        check.className = 'checkbox';
                                        check.disabled = true;
                                        if(response[response.field[q]][0] == 'Y'){
                                            check.checked = true;
                                        } else if (response[response.field[q]][0] == 'N') {
                                            check.checked = false;
                                        }
                                        option.appendChild(check);
                                    } else {
                                        cell.innerHTML = response[response.field[q]][0];
                                    }
                                }
                            }
                        }

                    }
                }catch (e){
                    var ee = document.getElementById("error");
                    ee.style.display = "block";
                    ee.style.color = "red";
                    ee.innerHTML = json;
                    closeMsg();
                    return;
                }
            }
        }
    };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);
}*/
