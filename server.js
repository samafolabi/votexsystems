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

var globalUser = '', globalVUser = '', globalVNum = -1;

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
    {uname: req.body.uname.toLowerCase()}]}, function (err, result) {
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
                    uname: req.body.uname.toLowerCase(),
                    pword: hash,
                    systems: []
                };
                db.collection("users").insertOne(newuser, function (err, resultt) {
                    if (err) errFunc();
                    globalUser = req.body.uname.toLowerCase();
                    res.write(req.body.uname.toLowerCase());
                    res.end();
                })
            })
        }
    })
});

app.post('/login', function (req, res) {
    var uname = req.body.user.toLowerCase();
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
    db.collection("users")
    .find({uname: globalUser})
    .project({_id:0, pword:0}).toArray(
        function (err, data) {
            if (err) errFunc(err, res);
            res.write(JSON.stringify(data[0]));
            res.end();
        }
    );
})

app.post("/editprofile", function (req, res) {
    //var id = req.body.keys()[0];
    //var text = req.body[""+id];
    var update = {$set: {}};
    update.$set[Object.keys(req.body)[0]] = req.body[[Object.keys(req.body)[0]]];
    db.collection("users").updateOne({uname: req.query.uname},
    update, function(err, data) {
        if (err) errFunc(err, res);
        res.write(JSON.stringify(req.body));
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
        //status: 1,
        //createdate: new Date().toUTCString(),
        des: req.body.sysdes,
        start: req.body.sysstart, //convertToFormat(req.body.syssdate, req.body.sysstime, req.query.offset),
        close: req.body.sysclose,//convertToFormat(req.body.syscdate, req.body.sysctime, req.query.offset),
        candidates: cands,
        votes: votes,
        voternames: [],
        voters: []
    }
    var update = {$push: {systems: newsys}}
    db.collection("users").updateOne({uname: globalUser},
    update, function (err, data) {
        if (err) errFunc(err, res);
        db.collection("users").findOne({uname: globalUser},
            {systems: 1}, function (err, data) {
                if (err) errFunc(err, res);
                res.write(JSON.stringify(data));
                res.end();
            })
    })
})

app.post("/editsys", function (req, res) {
    var candnum = parseInt(req.query.candnum);
    var cands = {};
    var votes = {};
    for (i = 1; i <= candnum; i++) {
        cands[req.body["candi"+i]] = req.body["candt"+1];
        votes[req.body["candi"+i]] = 0;
    }

    var newsys = {
        name: req.body.sysname,
        des: req.body.sysdes,
        start: req.body.sysstart, //convertToFormat(req.body.syssdate, req.body.sysstime, req.query.offset),
        close: req.body.sysclose,//convertToFormat(req.body.syscdate, req.body.sysctime, req.query.offset),
        candidates: cands,
        votes: votes,
        voternames: [],
        voters: []
    }
    var update = {$set: {}};
    update.$set["systems."+req.query.i] = newsys;
    db.collection("users").updateOne({uname: globalUser},
    update, function (err, data) {
        if (err) errFunc(err, res);
        db.collection("users").findOne({uname: globalUser},
            {systems: 1}, function (err, data) {
                if (err) errFunc(err, res);
                res.write(JSON.stringify(data));
                res.end();
            })
    })
})

app.post("/delsys", function (req, res) {
    var update = {$pull: {systems: {name: ""}}};
    update.$pull.systems.name = req.query.text;
    db.collection("users").updateOne({uname: globalUser},
    update, function (err, data) {
        if (err) errFunc(err, res);
        db.collection("users").findOne({uname: globalUser},
            {systems: 1}, function (err, data) {
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
    var user = req.params.user.toLowerCase();
    var system = req.params.system;
    var name = "";

    db.collection("users").findOne({uname: user}, {uname:0, _id:0, pword:0},
    function(err, result1) {
        if (err) errFunc(err, res);
        if (result1) {
            name = (result1.acctv == "org") ? result1.orgname : result1.fname + " " + result1.lname;
            var systems = result1.systems.slice();
            for (i = 0; i < systems.length; i++) {
                if (systems[i].name.toLowerCase() == system.toLowerCase()) {
                    globalVUser = user;
                    globalVNum = i;
                    var status = 1;
                    var today = new Date();
                    if (new Date(systems[i].start) < today) {
                        if (new Date(systems[i].close) < today) {
                            status = -1;
                        } else {
                            status = 0;
                        }
                    } else {
                        status = 1;
                    }
                    var obj = {name: name,
                        sysname: systems[i].name,
                        candidates: systems[i].candidates,
                        status: status,
                        activeDate: systems[i].start};
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

    db.collection("users").findOne({uname: globalVUser}, {systems:1},
        function (err, data) {
            if (err) errFunc(err, res);
            var voters = data.systems[globalVNum].voters.slice();
            if (voters.indexOf(req.query.ip) > -1) {
                res.write("false");
                res.end();
            } else {
                var update = data.systems.slice();
                update[globalVNum].voters.push(req.query.ip);
                update[globalVNum].voternames.push(req.query.voter);
                update[globalVNum].votes[body]++;
                db.collection("users").updateOne({uname: globalVUser},
                    {$set:{'systems': update}}, function (err, data) {
                        if (err) errFunc(err, res);
                        res.write("true");
                        res.end();
                })
            }
        })
    
    //errFunc, system, lowercase, data, create, list, ip address one time vote
})



mongo.connect(mongoUrl, function (err, dbase) {
    if (err) throw err;
    db = dbase.db("votex");
    var port = process.env.PORT || 443;
    app.listen(port, function () {
        console.log("Server running at port "+port);
    });
})
