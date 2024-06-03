const path = require('path');
const express = require('express');
const admin = require('firebase-admin');
const firebaseApp = require('firebase/app');
const http = require('http')

const app = express(),
      bodyParser = require("body-parser");
      PORT = 3080;

const mariadb = require('./modules/database/mariadb');
const user = require('./modules/users/user');
const routes = require('./routes');
const { startSocketIo } = require('./modules/socket');


// initialize firebase

try {
    const firebaseConfig = require("./config/firebase.js");
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig.firebaseAdmin)
    });
    firebaseApp.initializeApp(firebaseConfig.firebaseConfig);
} catch (error) {
    console.error(error)
}


// initialize mariadb pool as global variable

let mariaPool;
(async () => {
    mariaPool = await mariadb.mariaPoolInit();
    if(mariaPool === false){
        console.log("could not init mariadb pool")
    }
    global.mariaPool = mariaPool;
})();


function startServer({port = PORT} = {}) {

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, '../../vue-app/dist')));
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST, GET")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Accept-Encoding", "gzip, deflate, br");
      next();
    });

    //console.log(path.join('../../vue-app/dist/index.html'))

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.use('/api', routes.getRoutes());
    //app.use(errorMiddleware);


    return new Promise(resolve => {
        const server = http.createServer(app)
        server.listen(port, () => {
            console.log(`Server listening on the port::${port}`);

            /*// this block of code turns `server.close` into a promise API
            const originalClose = server.close.bind(server)
            server.close = () => {
                return new Promise(resolveClose => {
                    originalClose(resolveClose)
                })
            }
            // this ensures that we properly close the server when the program exists
            setupCloseOnExit(server)*/
            // resolve the whole promise with the express server
            resolve(server)
        })
    })
}


// ensures we close the server in the event of an error.
function setupCloseOnExit(server) {
    // thank you stack overflow
    // https://stackoverflow.com/a/14032965/971592
    async function exitHandler(options = {}) {
        await server
            .close()
            .then(() => {
                console.log('Server successfully closed')
            })
            .catch(e => {
                console.log('Something went wrong closing the server', e.stack)
            })
            if (options.exit) process.exit()
    }
    // do something when app is closing
    process.on('exit', exitHandler)
    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit: true}))
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, {exit: true}))
    process.on('SIGUSR2', exitHandler.bind(null, {exit: true}))
    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit: true}))
}

startServer()
    .then(server => {
        startSocketIo(server)
    })


/*function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    next(error)
  } else {
    logger.error(error)
    res.status(500)
    res.json({
      message: error.message,
      // we only add a `stack` property in non-production environments
      ...(process.env.NODE_ENV === 'production' ? null : {stack: error.stack}),
    })
  }
}*/




//app.listen(port, async () => {
    /*let sqlStmt = 'SELECT * FROM users';
    //let params = [];
    let rows = await mariaDB.query(sqlStmt, params);

    rows.forEach((item) => {
        console.log(item);
    });*/

    /*let params = {
        FirstName: 'Alex',
        LastName: 'Louis',
        Phone: '123.456.7890',
        Email: 'alex@gmail.com',
        AccountType: 2,
        OrganizationID: 1,
    }

    let newUser = new user.User(params);
    let dbConn = await mariaDB.getConn();
    let results = await newUser.create(dbConn);
    console.log(results);*/
//});
