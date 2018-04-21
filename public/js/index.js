function ajax(url, data, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        } else if (this.status == 404) {
            alert("ERROR");
        }
    }
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(data);
}

var logsup = function () {
    ajax('login', $('#logf').serialize(), function(res) {
        if (res == "false") {
            alert("User not found");
        } else {
            document.cookie = "uname=" + res;
            window.location = "/dashboard";
        }
    });
}

var signsup = function () {
    if ($("#email").val() == $("#cemail").val()) {
        if ($("#pword").val() == $("#cpword").val()) {
            ajax('signup', $('#signf').serialize(), function(res) {
                if (res == "false") {
                    alert("User already registered");
                } else {
                    document.cookie = "uname=" + res;
                    window.location = "/dashboard";
                }
            });
        } else {
            alert("Please confirm your password")
        }
    } else {
        alert("Please confirm your email")
    }
    
}



function getCookie(name, cookie) {
    var value = "; " + cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}