//imports
const express = require('express');
const cors = require('cors');
const cfenv = require('cfenv');
const bodyParser = require('body-parser');

//setup
const config = require('./config.json');
const origin = ['localhost:4200'];
const app = express();
const router = express.Router();
process.env.HOST = config.env.host;
process.env.PORT = config.env.port;
const port = process.env.PORT;
const host = process.env.HOST;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

var mydb;

//server code
app.use(cors(origin));

//root 
app.get('/', (req, resp) => {
    resp.send({message: 'Cloudant DB Server'});
});

app.use('/api', router);

router.post('/visitors', (req, resp) => {
    console.log('request received:', req.body);
    let name = req.body.name;
    if(!mydb) {
        console.log("No database.");
        resp.send("Hello " + userName + "!");
        return;
      }
    mydb.insert({ "name": name }, (err, body, header) => {
        if(err) {
            return console.log('failed to insert');
        }
        resp.status(200).send({message:"name has been added"});
    });
});

router.get("/visitors", function (request, response) {
    var names = [];
    if(!mydb) {
      response.json(names);
      return;
    }
  
    mydb.list({ include_docs: true }, function(err, body) {
      if (!err) {
        body.rows.forEach(function(row) {
          if(row.doc.name)
            names.push(row.doc.name);
        });
        response.json(names);
      }
    });
  });

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  if (appEnv.services['cloudantNoSQLDB']) {
     // CF service named 'cloudantNoSQLDB'
     var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     // user-provided service with 'cloudant' in its name
     var cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }

  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}

app.listen(port, host, () => {
    console.log('Server is listening on port ', port, ' host ', host);
});


