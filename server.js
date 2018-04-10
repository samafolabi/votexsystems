const fs = require('fs');
const express = require('express');
const mongo = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const bcrypt = require("bcrypt");
const cookie = require('cookie-parser');

var mongoUrl = "mongodb+srv://emperorsam:emperor2001@maincluster-rui0f.mongodb.net/votex";
var db;
const app = express();
var forceSSL = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
}

var globalUser = '', globalVUser = '', globalVNum = -1;

app.use(forceSSL);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array()); 
app.use(express.static('public'));
app.use(cookie());

function outputFile(file, res) {
    fs.readFile(file, function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': "text/html"});
        } else {
            res.writeHead(200, {'Content-Type': "text/html"});
            res.write(data.toString());
        }
    })
    res.end()
}

function errFunc(err, res) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end();
    throw err;
}

app.post('/signup', function (req, res) {
    db.collection("users").findOne(
    {$or: [{email: req.body.email},
    {uname: req.body.uname}]}, function (err, result) {
        if (err) errFunc();
        if (result) {
            res.write("false");
            res.end();
        } else {
            bcrypt.hash(req.body.pword, 10, function (err, hash) {
                if (err) errFunc();
                var newuser = {
                    acctv: req.body.acctv,
                    orgname: req.body.orgname,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    uname: req.body.uname,
                    pword: hash,
                    systems: []
                };
                db.collection("users").insertOne(newuser, function (err, resultt) {
                    if (err) errFunc();
                    globalUser = req.body.uname;
                    res.write(req.body.uname);
                    res.end();
                })
            })
        }
    })
});

app.post('/login', function (req, res) {
    var uname = req.body.user;
    var pword = req.body.pass;
    var users = db.collection("users").findOne({uname: uname},
    {uname: 1, pword: 1}, function (err, result) {
        if (err) {
            errFunc(err, res);
        };
        if (result) {
            bcrypt.compare(pword, result.pword, function (err, match) {
                if (err) {
                    errFunc(err, res);
                };
                if (match) {
                    globalUser = uname;
                    res.write(uname);
                    res.end();
                } else {
                    res.write("false");
                    res.end();
                }
            })
        } else {
            res.write('false');
            res.end();
        }
    });
});

app.use('/dashboard', function (req, res) {
    var val = getCookie('uname', req.headers.cookie);
    if (val !== undefined) {
        globalUser = val;
        //outputFile("dashboard.html", res);
        fs.readFile("public/dashboard.html", function (err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': "text/html"});
                res.end();
            } else {
                res.writeHead(200, {'Content-Type': "text/html"});
                res.write(data.toString());
                res.end();
            }
        })          
    } else {
        res.writeHead(302, {'Location': '/'});
        res.end();
    }
})

function getCookie(name, cookie) {
    var value = "; " + cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

app.post("/prosys", function (req, res) {
    db.collection("users").findOne({uname: globalUser},
    {pword: 0, _id: 0}, function (err, data) {
        if (err) errFunc(err, res);
        res.write(JSON.stringify(data));
        res.end();
    })
})

function convertToFormat(date, time, offset) {
    var string = date + "T" + time + ":00";
    if (offset > 0) {
        string += "-" + (("0" + (offset / 60)).slice(-2)) + (("0" + (offset % 60)).slice(-2));
    } else if (offset < 0) {
        string += "+" + (("0" + (offset / 60)).slice(-2)) + (("0" + (offset % 60)).slice(-2));
    } else {
        string += "Z";
    }
    return string;
}

app.post("/createsys", function (req, res) {
    var candnum = parseInt(req.query.candnum);
    var cands = {};
    var votes = {};
    for (i = 1; i <= candnum; i++) {
        cands[req.body["candi"+i]] = req.body["candt"+1];
        votes[req.body["candi"+i]] = 0;
    }

    var newsys = {
        name: req.body.sysname,
        status: 1,
        createdate: new Date().toUTCString(),
        des: req.body.sysdes,
        start: convertToFormat(req.body.syssdate, req.body.sysstime, req.query.offset),
        close: convertToFormat(req.body.syscdate, req.body.sysctime, req.query.offset),
        candidates: cands,
        votes: votes
    }
    var update = {$push: {systems: newsys}}
    db.collection("users").updateOne({uname: globalUser},
    update, function (err, data) {
        if (err) errFunc(err, res);
        db.collection("users").findOne({uname: globalUser},
            {pword: 0, _id: 0}, function (err, data) {
                if (err) errFunc(err, res);
                res.write(JSON.stringify(data));
                res.end();
            })
    })
})

app.use('/vote/:user/:system', function (req, res) {
    fs.readFile("public/vote.html", function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': "text/html"});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': "text/html"});
            res.write(data.toString());
            res.end();
        }
    })  
})

app.post('/votex/:user/:system', function (req, res) {
    var user = req.params.user;
    var system = req.params.system;
    var name = "";

    db.collection("users").findOne({uname: user},
    function(err, result1) {
        if (err) errFunc(err, res);
        if (result1) {
            name = (result1.acctv == "org") ? result1.orgname : result1.fname + result1.lname;
            var systems = result1.systems.slice();
            for (i = 0; i < systems.length; i++) {
                if (systems[i].name == system) {
                    globalVUser = user;
                    globalVNum = i;
                    var obj = {name: name, candidates: systems[i].candidates};
                    res.write(JSON.stringify(obj));
                    res.end();
                    break;
                }
            }
        }
    })
})

app.post('/voting', function (req, res) {
    var body = Object.keys(req.body)[0];
    var update = {"$inc":{"":""}};
    update["$inc"]["systems."+globalVNum+".votes."+body] = 1;
    
    db.collection("users").updateOne({uname: globalVUser},
        update, function (err, data) {
        if (err) errFunc(err, res);
        res.write("true");
        res.end();
    })
})




/*app.use('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
});*/



mongo.connect(mongoUrl, function (err, dbase) {
    if (err) throw err;
    db = dbase.db("votex");
    app.listen(8000, function () {
        console.log("Server running at port 8000"+process.env.NODE_ENV);
    });
})
