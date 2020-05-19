var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment'); // require
moment().format();
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
    secret: 'super secret key',
    resave: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },  // 8 hours
    saveUninitialized: true,
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

app.get('/candidiate-profile', function (request, response) {
    if (request.session.loggedin) {
        if (request.query.email) {
            let user_email_address = request.query.email; // $_GET["id"]
            console.log("Hello " + user_email_address);
            let SQL_BASIC_DETAILS = "SELECT * FROM ProjectAssistant.BasicUserDetails where Email = ? ORDER BY id DESC LIMIT 1";
            let SQL_PROJECT = "SELECT * FROM ProjectAssistant.ProjectDetails where Email  = ? ORDER BY id DESC LIMIT 1;";

            var inserts_email = [user_email_address];
            sql_1 = mysql.format(SQL_BASIC_DETAILS, inserts_email);
            sql_2 = mysql.format(SQL_PROJECT, inserts_email);


            connection_root.query("SELECT * FROM ProjectAssistant.BasicUserDetails where Email = ? ORDER BY id DESC LIMIT 1;SELECT * FROM ProjectAssistant.ProjectDetails where Email  = ? ORDER BY id DESC LIMIT 1;SELECT * FROM ProjectAssistant.GeneralInformationUser WHERE EmailID = ? ORDER BY id DESC LIMIT 1;SELECT * FROM ProjectAssistant.QualificationsDetails where Email = ? order by id;SELECT * FROM ProjectAssistant.WorkExpereince where Email = ?;SELECT * FROM ProjectAssistant.UserAceivementsAndScore WHERE Email = ?;", [user_email_address, user_email_address, user_email_address, user_email_address, user_email_address, user_email_address], function (error, results, fields) {
                // connect[0][0]
                for (let i = 0; i < results[4].length; i++) {
                    var date = moment(results[4][i].FromDate);
                    var dateComponent = date.utc().format('DD-MM-YYYY');
                    results[4][i].FromDate = dateComponent
                    results[4][i].ToDate = dateComponent
                    console.log(results[4][i].FromDate);
                }
                let values = { Name: results[0][0].Name, FAName: results[0][0].FathersName, Gender: results[0][0].Gender, Category: results[0][0].UserCategory, Nationality: results[0][0].Nationality, DOB: moment(results[0][0].DOB).format('DD/MM/YYYY'), Email: results[0][0].Email, PhoneNumber: results[0][0].PhoneNumber, Address: results[0][0].Address, SkypeID: results[0][0].SkypeID, ZoomID: results[0][0].ZoomID, WhatsAppNumber: results[0][0].WhatsAppNumber, PWDStatus: results[0][0].PWDStatus, DisabilityPercentage: results[0][0].DisabilityPercentage, Timestamp: results[0][0].Timestamp, ApplicationNumber: results[0][0].Application_Number, Title: results[1][0].Title, Organisation: results[1][0].Organisation, Duration: results[1][0].Duration, Desc: results[1][0].Description, CloseRelative: results[2][0].CloseRelatives, BondContact: results[2][0].BondContarctual, Dismissed: results[2][0].dismissedEver, OtherInfo: results[2][0].OtherInformation, Qualification: results[3], EmploymentHistory: results[4], ExamsAndExtras: results[5], Timestamp: moment(results[0][0].Timestamp).format("MMMM Do YYYY") };
                response.render('user-profile', values);
                console.log(results[5]);

            });
        }
        else {
            response.redirect('/')
        }
    }
    else {
        response.redirect('/')
    }
});

app.listen(3005);