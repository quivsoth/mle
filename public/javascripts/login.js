const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }; 

const tryLogin = () => {
    const $result = $('#result');
    $result.css('color', 'green');
    $result.text('Authorizing...');

    var l = document.getElementById("l").value;
    var p = document.getElementById("p").value;

    let err = {};
    let errMessage = (m) => {
        $result.css('color', 'red');
        $result.text(m);
    }

    if(l === '') { err.message = 'Login/Email cannot be blank.' }
    else if(p === '') { err.message = 'Password cannot be blank.' }
    else if(p.length < 6) { err.message = 'Your password cannot be less than 6 characters. Please check for accuracy!' }
    else if (!validateEmail(l)) { err.message = 'Not a valid email, please try again.' }

    if(!err.message) {
        var c = {"p" : p, "l" : l};
        post("/user/a", c, (result) => { 
        if(result==="\"OK\"") { 
            // Event to be fired here
            $result.text("WELOME!") 
        } 
        else { errMessage(result) }
        });
    } 
    else { errMessage(err.message) }
}