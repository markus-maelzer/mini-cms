var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

var bodyParser = require('body-parser');
var multer = require('multer');
var port = 3000;

var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('changeNotes' , function (data) {
    updateData(data, 'notizen');
    socket.emit('success', {text: 'notes', id: data.id});
  })
  socket.on('changeName', function (data) {
    updateData(data, 'name');
    socket.emit('success', {text: 'name', id: data.id})
  })
  socket.on('image uploaded', function (data) {
    setTimeout(function () {
      updateData({value: image_name, id: data}, 'image');
    }, 200)

  })
});

function updateData(arg, sring) {
  var sData = arg;
  fs.readFile(DATA_FILE, function (err, data) {
    var fsData = JSON.parse(data);
    console.log(fsData[sData.id]);
    console.log(sData.value);
    fsData[sData.id][sring] = sData.value;

    fs.writeFile(DATA_FILE, JSON.stringify(fsData, null, 2));
  })
}

server.listen(port, function () {
  console.log('Server definately not running on port: ' + port);
});

// https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm
// https://www.quora.com/What-are-the-best-resources-to-learn-Express-js

// Create application/x-www-form-urlencoded parser
var DATA_FILE = path.join(__dirname , 'data/data.json');
app.get('/data', function (req, res) {
  fs.readFile(DATA_FILE, function (err, data) {
    res.setHeader('Cache-Control', 'no-chache');
    res.json(JSON.parse(data));
  })
})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload/')
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

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html')
})



app.post('/process_post', function (req, res) {
  response = {
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    image: req.body.file,
  };
  console.log(response);
  console.log('file: ' + req.body.file);
  res.end(JSON.stringify(response));
})


// helpful example
// https://github.com/stahlmanDesign/node-express-multer-image-upload
var image_name;

app.post('/upload', function (req, res) {

  var file = __dirname + '/' + req.file.destination + req.file.filename;
  image_name = 'upload/'+ req.file.filename;
  console.log(image_name);
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
