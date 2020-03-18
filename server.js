var Express = require('express');
var multer = require('multer');
const {
  Storage
} = require('@google-cloud/storage');
var bodyParser = require('body-parser');
var app = Express();
app.use(bodyParser.json());
var tesseract = require('node-tesseract');
const cors = require('cors');
app.use(cors());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})

const storage = new Storage();

var Port = process.env.PORT;

var options = {
  // Use the english and german languages
  l: 'eng',
  // Use the segmentation mode #6 that assumes a single uniform block of text.
  psm: 6
};


var fname;
var diskStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    // console.log(file);
    callback(null, "./files");
  },
  filename: function(req, file, callback) {
    // console.log(file);
    fname = Date.now() + "_" + file.originalname;
    callback(null, fname);
  }
});
var upload = multer({
  storage: diskStorage
}).array("file", 10000); //Field name and max count


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/Upload", function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      res.send(err);
      return res.end("cannot be done!");
    } else {
      const filePath = __dirname + "/files/" + fname;
      storage.bucket('fa-web-assets').upload(filePath, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        destination: 'other-assets/'+fname,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: 'public, max-age=31536000',
        },
      }, function(err, data) {
        storage
          .bucket('fa-web-assets')
          .file('other-assets/'+fname)
          .makePublic(function(err, file){
            if (err) {
              res.json({message: "Error while uploading"});
            }
            res.json({
              filePath: 'https://storage.googleapis.com/'+file.bucket+"/"+file.object
            });
          });
      });
    };

  })
});

app.get("/retriveFile", (req, res) => {
  var filename = req.query.name;
  res.sendFile(__dirname + "/files/" + filename);
})

app.listen(Port || 3000, function() {
  console.log("Listen!");
});