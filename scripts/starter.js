function showSettings(id){
    var settings = document.getElementById(id);
    var list = settings.children[1].style.display;
    settings.children[1].style.display = list=="block"?"none":"block";
}


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

function doSSH(id)
{
    var row = document.getElementById(id);
    var xmlhttp = getXmlHttp();
    var parameters = {};
    parameters.host = row.cells[5].children[0].value;
    parameters.id = row.cells[1].innerHTML;
    var json = JSON.stringify(parameters);
    var par = "data="+encodeURIComponent(json);
    var ee = document.getElementById("error");
    ee.style.color = "white";
    ee.innerHTML = "Loading...";
    ee.style.display = "block";
    xmlhttp.open('POST','http://administrating/Remote/Execute', true);
    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState == 4){
         if(xmlhttp.status == 200){
             ee.innerHTML = xmlhttp.responseText;
             //closeMsg();
         }
        }
      };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(par);
}

function closeMsg()
{
    setTimeout(function(){document.getElementById('error').style.display='none';location.reload()},2000);
}

function correctAllDates(){
    var tables = document.getElementsByTagName("TABLE");
    for(var q = 0;q<tables.length-1;q++){
        var table = tables[q];
        var max = table.rows.length;
        for(var i=1;i<max;i++){
            var date = table.rows[i].cells[3].innerHTML;
            if(date != "Нет данных"){
                table.rows[i].cells[3].innerHTML = correctDate(date);
            }
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

function getData(type,name){
    if(document.getElementById('Subsidiary') != null) {
        var block = document.getElementById('Subsidiary')
        block.parentNode.removeChild(block);
    }
    var block = document.body.appendChild(document.createElement('div'));
    block.id = 'Subsidiary'
    block.className = 'popup'
    /*var table = document.getElementById("popup_table");
    while(table.children.length){
        table.removeChild(table.children[table.children.length-1])
    }
    document.getElementById("infoArea").children[0].innerHTML = name;
    document.getElementById("popup").style.display = "block";*/
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', 'http://administrating/Popup/Get/Target/' + type.toUpperCase(),true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);


                    var frame = createFrame(name)
                    block.appendChild(frame)
                    var content = document.getElementById('content')
                    var table = createTable(response,type)
                    content.appendChild(table)
                }catch(e){
                    var ee = document.getElementById("error");
                    ee.innerHTML = json;
                    ee.style.display = "block";
                    //closeMsg();
                    return;
                }
            }
        }
    };
    xmlhttp.send(null);
}

function saveChanges(type,name){
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

function deleteRow(number,type,name){
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
    var table = document.getElementById("popup").getElementsByTagName("table")[0];
    var info = {};
    var container = document.createElement("button");
    container.className = "classname vis blue";
    container.innerHTML = "Save";
    var edt = function(){
        editRow(number,type,info,name);
        return false;
    };
    container.onclick = edt;
    for(var i = 0;i<table.rows[number].cells.length;i++){
        var cell = table.rows[number].cells[i];
        if(i != table.rows[0].cells.length-1){
            var field = table.rows[0].cells[i].innerHTML;
            if(field == 'IS_ENABLED'){
                info['BEFORE_' + field] = cell.children[0].children[0].checked == true ? 'Y' : 'N';
                cell.children[0].children[0].disabled = false;
                continue;
            }
            var example = table.rows[table.rows.length-1].cells[i].children[0].cloneNode(true);
            info['BEFORE_' + field] = cell.innerHTML;
            cell.innerHTML = "";
            cell.appendChild(example);
            if(cell.getElementsByTagName("option")[0] != null){
                var options = cell.getElementsByTagName("option");
                for(var k in options){
                    if(options[k].innerHTML === info['BEFORE_' + field]){
                        options[k].innerHTML = "";
                    }else if (k == 0){
                        options[k].innerHTML = info['BEFORE_' + field];
                    }
                }
            }else{
                var input = cell.getElementsByTagName("input")[0].value = info['BEFORE_' + field];
            }
        }else{
            cell.replaceChild(container,cell.children[0]);
        }

    }
}
function editRow(number,type,before,name){
    var table = document.getElementById("popup").getElementsByTagName("table")[0];
    var after = {};
    for(var i = 0;i<table.rows[number].cells.length-1;i++){
        var field = table.rows[0].cells[i].innerHTML;
        if(table.rows[0].cells[i].innerHTML == 'IS_ENABLED') {
            var state = table.rows[number].cells[i].children[0].children[0].checked;
            after['AFTER_' + field] = state == true ? 'Y' : 'N';
        } else{
            after['AFTER_' + field] = table.rows[number].cells[i].children[0].children[0].value;
        }
    }
    for (var key in before){
        after[key] = before[key];
    }
    var json = JSON.stringify(after);
    var par = "data="+encodeURIComponent(json);
    var xmlhttp = getXmlHttp();
    var url = 'http://administrating/Popup/Update/Target/' + type.toUpperCase();
    xmlhttp.open('POST', url ,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                    for(var i = 0;i<table.rows[number].cells.length;i++){
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
}

/*function getHeartBeat(){
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', 'http://administrating/Monitor/',true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                }catch (e){
                    //location.reload();
                }
            }
        }
    };
    xmlhttp.send(null);
}*/

function showDetails(element){
    element.style.display = element.style.display == 'none' ? 'block' : 'none';
}


function showSchedules(){
    if(document.getElementById('Subsidiary') != null) {
        var block = document.getElementById('Subsidiary')
        block.parentNode.removeChild(block);
    }
    var block = document.body.appendChild(document.createElement('div'));
    block.id = 'Subsidiary'
    block.className = 'popup'
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', 'http://administrating/Popup/Get/Target/SCHEDULES',true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);

                    var frame = createFrame('Schedules')
                    block.appendChild(frame);
                    var content = document.getElementById('head')
                    var select = scheduleContainer(response);
                    content.appendChild(select);
                }catch (e){
                    return false;
                }
            }
        }
    };
    xmlhttp.send(null);
}

function showHosts(app){
    if(document.getElementById('Subsidiary') != null) {
        var block = document.getElementById('Subsidiary')
        block.parentNode.removeChild(block);
    }
    var block = document.body.appendChild(document.createElement('div'));
    block.id = 'Subsidiary'
    block.className = 'popup'
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', 'http://administrating/Popup/applicationHosts/Application/' + app,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                    var frame = createFrame('Hosts Attachments')
                    frame.children[0].style.width = '300px'
                    frame.children[1].style.width = '500px'
                    frame.children[1].style.margin = '0 auto'
                    block.appendChild(frame);
                    var content = document.getElementById('content')
                    var host = hostContainer(response);
                    content.appendChild(host);
                }catch (e){
                    return false;
                }
            }
        }
    };
    xmlhttp.send(null);
}

function showInstances(app){
    if(document.getElementById('Subsidiary') != null) {
        var block = document.getElementById('Subsidiary')
        block.parentNode.removeChild(block);
    }
    var block = document.body.appendChild(document.createElement('div'));
    block.id = 'Subsidiary'
    block.className = 'popup'
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', 'http://administrating/Popup/applicationInstances/Application/' + app,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText;
                try{
                    var response = JSON.parse(json);
                    var frame = createFrame('Instances Attachments')

                    block.appendChild(frame);
                    var content = document.getElementById('content')
                    var table = createTable(response)
                    content.appendChild(table);
                }catch (e){
                    return false;
                }
            }
        }
    };
    xmlhttp.send(null);
}

function showEvents(schedule){

    var details = document.getElementById('head').children[0].children[1]
    if(schedule.value == '') {
        details.style.display = 'none'
        return
    }
    var selected = schedule.options[schedule.selectedIndex]
    var xmlhttp = getXmlHttp()
    xmlhttp.open('GET', 'http://administrating/Popup/Show/Events/' + selected.id,true)
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText
                try{
                    var response = JSON.parse(json)
                    details.style.display = 'block'
                    document.getElementById('schedule_state').checked = selected.title == "Y" ? true : false

                }catch (e){
                    return false
                }
                var content = document.getElementById('content')
                var table = createTable(response)
                content.appendChild(table);
            }
        }
    };
    xmlhttp.send(null)
}

function showEventsMapping(app){
    if(document.getElementById('Subsidiary') != null) {
        var block = document.getElementById('Subsidiary')
        block.parentNode.removeChild(block)
    }
    var block = document.body.appendChild(document.createElement('div'))
    block.id = 'Subsidiary'
    block.className = 'popup'
    var xmlhttp = getXmlHttp()
    xmlhttp.open('GET', 'http://administrating/Popup/applicationEvents/Application/' + app,true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var json = xmlhttp.responseText
                try{
                    var response = JSON.parse(json)
                    var frame = createFrame('Events Mapping')
                    block.appendChild(frame)
                    var content = document.getElementById('content')
                    var table = createTable(response)
                    content.appendChild(table)
                }catch (e){
                    return false
                }
            }
        }
    };
    xmlhttp.send(null)
}

function submitForm(block,type)
{
    var xmlhttp = getXmlHttp()
    block = block.querySelectorAll('input,textarea,select')
    var parameters = {}
    var before = {}
    for(var i in block ){
        var value = block[i].name == 'IS_ENABLED' ? ( block[i].checked === true ? 'Y' : 'N' ) : block[i].value
        if(type === 'Insert' || type == 'Delete'){
            parameters[block[i].name] = value
        } else if (type === 'Update'){
            if(!block[i].disabled){
                parameters['AFTER_' + block[i].name] = value
            }else if (block[i].disabled){
                before['BEFORE_' + block[i].name] = value
            }
        }
    }
    for (var key in before){
        parameters[key] = before[key];
    }
    console.log(parameters)
    var json = JSON.stringify(parameters)
    var par = "data="+encodeURIComponent(json)
    xmlhttp.open('POST','http://administrating/Popup/' + encodeURIComponent(type) + '/Target/APPLICATIONS', true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState == 4){
            if(xmlhttp.status == 200){
                console.log(xmlhttp.responseText)
            }
        }
    };
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xmlhttp.send(par)
}