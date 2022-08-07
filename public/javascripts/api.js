fetch = async(url, callback) => {
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
    console.log(JSON.stringify(data));
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
}