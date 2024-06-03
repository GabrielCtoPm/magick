const express = require('express');
const multer  = require('multer');
const firebase = require('../modules/database/firebase');
const awsS3 = require('../modules/aws/s3');
const config = require('../config/aws_config.js');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

/*
 * all routes
 */
function getPDFRoutes(){
    const router = express.Router();
    router.get('/get', getPDF);
    router.post('/upload', upload.single('file'), uploadPDF);
    return router;
}
module.exports.getPDFRoutes = getPDFRoutes;


async function getPDF(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.query.token);
    if(user === false){
        res.status(401).send("no access");
        return;
    }


    let s3 = awsS3.initS3(config.S3_TOKEN);
    let s3Key = req.query.path;
    let bucketName = 'amc-documents';

    let contents = await awsS3.getFile(s3, bucketName, s3Key);
    //let contents = "";
    if(contents !== false){
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', contents.length);
        res.setHeader('Content-Disposition', 'filename=document.pdf');
        res.send(contents);

    } else{
        // send empty PDF that shows error
        res.send('');
    }
}


async function uploadPDF(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.body.token);
    if(user === false){
        res.status(401).send("no access");
        return;
    }

    let s3 = awsS3.initS3(config.S3_TOKEN);
    let s3Key = req.file.originalname;
    let bucketName = 'amc-documents';
    let success = await awsS3.uploadFile(s3, bucketName, s3Key, req.file.buffer);
    if(success !== false){
        res.json({
            code: 0,
            contents: ""
        });
    } else{
        res.json({
            code: 10,
            contents: ""
        });
    }
}
