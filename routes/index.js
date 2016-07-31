var express = require('express');
var router = express.Router();

var aws = require('aws-sdk');

// require multer
var multer = require('multer');
var multerS3 = require('multer-s3');

// require s3
var options = {
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  // Log output
  // logger: console
};

// create s3 client
var s3 = new aws.S3(options);

// create multer object
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'joshmagic',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "_" + file.originalname )
    }
  })
});


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
  console.log("Url of the new file: ", req.file.location);
  
  res.status(200).json({
    success: true,
    message: req.file.location
  });
  
});

module.exports = router;
