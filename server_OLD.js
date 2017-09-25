var express = require('express');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser');
var multer = require('multer');

var passport = require('passport')
  , Strategy = require('passport-local').Strategy
  , db = require('./db');

/*
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
*/
// https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm
// https://www.quora.com/What-are-the-best-resources-to-learn-Express-js

// Create application/x-www-form-urlencoded parser



passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/upload/')
  },
  filename: function (req, file, cb) {
    console.log(file);
    //console.log(file.mimetype)
    cb(null, file.originalname + '-' + Date.now() + '-' + getExtension(file));
  }
});

function getExtension(file) {
  // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
  var res = '';
  if (file.mimetype === 'image/jpeg') res = '.jpg';
  if (file.mimetype === 'image/png') res = '.png';
  if (file.mimetype === 'image/gif') res = '.gif';
  return res;
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: storage}).single('file'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
})
app.get('/login', function(req, res){
  res.sendFile(__dirname + '/public/login/' + 'index.html');
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('hi');
    res.redirect('/');
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/process_get', function (req, res) {
  response = {
    first_name: req.query.first_name,
    last_name: req.query.last_name
  };
  console.log(response);
  res.end(JSON.stringify(response));
})

app.post('/process_post', function (req, res) {
  response = {
    first_name:req.body.first_name,
    last_name:req.body.last_name
  };
  console.log(response);
  res.end(JSON.stringify(response));
})
// helpful example
// https://github.com/stahlmanDesign/node-express-multer-image-upload
app.post('/upload', function (req, res) {
  var file = __dirname + '/' +req.file.destination + req.file.filename;

  if(req.file.path)
    fs.readFile( req.file.path, function (err, data) {
      console.log(data);
      fs.writeFile(file, data, function (err) {
         if( err ){
            console.log( err );
            } else {
               response = {
                  message:'File uploaded successfully',
                  filename: req.file.filename
               };
            }
         console.log( response );
         res.end( JSON.stringify( response ) );
      });
    });
})

var server = app.listen(3000, function () {
  //var host = server.address().address
  var port = server.address().port

  console.log('Server is definately not running on port: ' + port);
});

/*
io.on('connection', function (socket) {
  socket.emit('news', {hello: 'world'});
  socket.on('changes', function (data) {
    console.log(data);
  })
})
*/
