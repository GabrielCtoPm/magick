const express = require('express');
const multer  = require('multer');
const firebase = require('../modules/database/firebase');
const email = require('../modules/message/email');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// https://firebase.google.com/products/extensions/firestore-send-email
// https://medium.com/firebase-developers/firebase-extension-trigger-email-5802800bb9ea

/*
 * all routes
 */
function getEmailRoutes(){
    const router = express.Router();
    router.post('/send', upload.single('file'), sendEmail);
    return router;
}
module.exports.getEmailRoutes = getEmailRoutes;


async function sendEmail(req, res) {
    //console.log(req.file);
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.body.token);
    if(user === false){
        res.status(401).send("no access");
        return;
    }

    // things to include in email
    let emailInfo = {
        fromEmail: user.email, // email of logged in user
        toEmails: req.body.toEmails,
        subject: req.body.subject,
        message: req.body.message,
    }
    // if attachment is included
    if(req.file !== undefined){
        emailInfo.attachment = req.file;
    }
    console.log(emailInfo);

    let contents = await email.send(emailInfo);
    console.log(contents);
    if(contents !== false){
        res.json({
            code: 0,
            contents: contents.toString()
        });

    } else{
        res.json({
            code: 10,
            contents: contents.toString()
        });
    }
}
