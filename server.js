var express = require('express');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: './upload/'});
/*
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
*/
// https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm
// https://www.quora.com/What-are-the-best-resources-to-learn-Express-js

// Create application/x-www-form-urlencoded parser

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(upload);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
})

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



var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Server is definately not running on Port: ' + port);
});


/*
app.use(express.static(path.join(__dirname, 'src')));

io.on('connection', function (socket) {
  socket.emit('news', {hello: 'world'});
  socket.on('changes', function (data) {
    console.log(data);
  })
})
*/
