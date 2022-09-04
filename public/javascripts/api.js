fetch = async(url, callback) => {
    //console.log("URL : " + url);
    //console.log("callback : " + callback);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            if (xhr.status == 200) { callback(xhr.response) }
            else if (xhr.status == 400) { console.log('There was an error 400') }
            else { console.log('something else other than 200 was returned') }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
},
put = (url, data, callback) => {
    console.log(data);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            if (xhr.status == 200) { callback(xhr.response) }
            else if (xhr.status == 400) { console.log('There was an error 400') }
            else { console.log('something else other than 200 was returned. : ' + xhr.status) }
        }
    };
    xhr.open("PUT", url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
},
cartDelete = (url, data, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            if (xhr.status == 200) { callback(xhr.response) }
            else if (xhr.status == 400) { console.log('There was an error 400') }
            else if (xhr.status == 404) { console.log('There was an error 404') }
            else { console.log('something else other than 200 was returned. : ' + xhr.status) }
        }
    };
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
},
sendToastMessage = (message) => {
    document.getElementById("toastMessage").innerText = message;
    $(".toast").toast('show');
}