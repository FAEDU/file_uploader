var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();
app.use(bodyParser.json());
var tesseract = require('node-tesseract');
const cors=require('cors');
app.use(cors());
app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');
    next();
})
var Port=process.env.PORT;

var options = {
    // Use the english and german languages
    l: 'eng',
    // Use the segmentation mode #6 that assumes a single uniform block of text.
    psm: 6
};


var fname;
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
    callback(null, "./files");
    },
    filename: function(req, file, callback) {
         fname=Date.now()+"_"+file.originalname;
         callback(null,fname);
  }
});
var upload = multer({
    storage: Storage
}).array("file",10000); //Field name and max count
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post("/api/Upload", function(req, res) {
  upload(req, res, function(err) {
        if (err) {
          res.send(err);
          return res.end("cannot be done!");
        }
        else{
  res.send(`https://floating-gorge-25007.herokuapp.com/retriveFile?name=${fname}**Copy this Link to your imageUrl field Form`);
        };

}
)


    });

app.get("/retriveFile",(req,res)=>{
var filename=req.query.name;
res.sendFile(__dirname+"/files/"+filename);
})

app.listen(Port||3000, function(){
  console.log("Listen!");
    });
