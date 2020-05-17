var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
    connectionLimit: 14,
    host: 'sarva-yoactiv-dailydump.ceb2y0xssrns.ap-south-1.rds.amazonaws.com',
    user: 'sarvaadmin',
    password: 'y4YYyoz4OBBpGUr7I3VP',
    database: 'nodelogin',
    multipleStatements: true
});

var connection_root = mysql.createConnection({
    connectionLimit: 14,
    host: 'sarva-yoactiv-dailydump.ceb2y0xssrns.ap-south-1.rds.amazonaws.com',
    user: 'sarvaadmin',
    password: 'y4YYyoz4OBBpGUr7I3VP',
    database: 'ProjectAssistant',
    multipleStatements: true
});


var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    secure: false, maxAge: null 
}));
var sess;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});
app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        connection_root.query('SELECT * FROM ProjectAssistant.QualificationsDetails;', function (error, results, fields) {
            // connected!
            console.log(results);
            response.render('index', { table_object_qualification: results });
        });
    } else {
        response.send('Please login to view this page!');
    }
    
});

app.post('/candidiate-profile', function (request, response) {
    if (request.session.loggedin) {
        connection_root.query('SELECT * FROM ProjectAssistant.BasicUserDetails where PhoneNumber = ?;SELECT * FROM ProjectAssistant.ProjectDetails where PhoneNumber = ?;SELECT * FROM ProjectAssistant.QualificationsDetails where PhoneNumber = ?;',['9176033298','9176033298','9176033298'], function (error, results, fields) {
            // connected!
            console.log(results);
            response.render('index', { table_object_qualification: results });
        });
    } else {
        response.send('Please login to view this page!');
    }
    
});
app.listen(3005);