let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let debug = require('debug')('lab7:app'); // add using the debugger tool
let mongoose = require('mongoose');       // add mongoose for MongoDB access
let session = require('express-session'); // add session management module
let connectMongo = require('connect-mongo'); // add session store implementation for MongoDB
var passport = require('passport');
let index = require('./routes/index');
let users = require('./routes/users');
let login = require('./routes/login');    // it will be our controller for logging in/out
var flash    = require('connect-flash');
let app = express();

(async () => {
    let MongoStore = connectMongo(session);
    let sessConnStr = "mongodb://user:user@yochidafna-shard-00-00-zemea.mongodb.net:27017,yochidafna-shard-00-01-zemea.mongodb.net:27017,yochidafna-shard-00-02-zemea.mongodb.net:27017/test?ssl=true&replicaSet=YochiDafna-shard-0&authSource=admin";
    let sessionConnect = mongoose.createConnection();
    try {
        await sessionConnect.openUri(sessConnStr);
    } catch (err) {
        debug(`Error connecting to session backend DB: ${err}`);
        process.exit(0);
    }
    process.on('SIGINT', async () => {
        await sessionConnect.close();
        process.exit(0);
    });

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    let secret = 'lab7 users secret'; // must be the same one for cookie parser and for session
    app.use(cookieParser(secret));

    app.use(session({
        name: 'users.sid',         // the name of session ID cookie
        secret: secret,            // the secret for signing the session ID cookie
        resave: false,             // do we need to resave unchanged session? (only if touch does not work)
        saveUninitialized: false,  // do we need to save an 'empty' session object?
        rolling: true,             // do we send the session ID cookie with each response?
        store: new MongoStore({ mongooseConnection: sessionConnect }), // session storage backend
        cookie: { maxAge: 900000, httpOnly: true, sameSite: true }  // cookie parameters
        // NB: maxAge is used for session object expiry setting in the storage backend as well
    }));
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    
    app.use(flash()); // use connect-flash for flash messages stored in session
    require('./config/passport')(passport);
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', index);
    app.use('/users', users);
    app.use('/login', login); // register login controller

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
})()
    .catch(err => { debug(`Failure: ${err}`); process.exit(0); });

module.exports = app;
