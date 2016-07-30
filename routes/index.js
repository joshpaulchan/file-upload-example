var express = require('express');
var router = express.Router();
var path = require('path');

// require multer
var multer = require('multer');

// create multer object
var upload = multer({ dest: 'uploads/' });

// require s3
var s3 = require('s3');

var options = {
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    // region: "oregon",
    // NEEDED for Buckets in Frankfurt (and change region)
    // signatureVersion: 'v4',
    // s3DisableBodySigning: true
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
  }
};

// create s3 client
var client = s3.createClient(options);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// POST to `/uploadFile`
// 
// Upload a file to this url
// 
// @note: upload.single(...) takes the name of the field you called the file on
// the client (in this example, you can see it's called 'fileName')
// @note: Doesn't matter if you used React or HTML forms to send the request
// @note: the`multer` package saves the file to the filesystem for you already,
// using `upload.single`
router.post('/url/to/upload/to', upload.single('fileName'), function(req, res, next) {
  // Receive file that was uploaded
  
  // Here, if you choose, you can send file to S3/filesystem/wherever
  console.log("Files that were uploaded: ", req.file);
  
  // Path of the file that was sent to server
  console.log("Relative path of the new file: ", req.file.path);
  
  var params = {
    // make absolute path
    localFile: req.file.path,
    
    s3Params: {
      // your s3 bucket name
      Bucket: process.env.UPLOAD_BUCKET_NAME,
      // key is the name you want your file to be on S3
      Key: req.file.path,
      // other options supported by putObject, except Body and ContentLength. 
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
    },
  };
  
  // create upload client
  var uploader = client.uploadFile(params);
  
  // add handler for errors
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
  });
  
  // add handler to show progress
  uploader.on('progress', function() {
    console.log("[progress]", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
  });
  
  // add handler to show end
  uploader.on('end', function() {
    console.log("done uploading");
  });
  
  res.status(200).json({
    success: true,
    message: "Upload OK"
  });
  
});

module.exports = router;
