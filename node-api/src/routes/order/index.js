const express = require('express');
const multer  = require('multer');
const admin = require('firebase-admin');
const firebase = require('../../modules/database/firebase');
const order = require('../../modules/order');
const comments = require('../../modules/order/comments');
const internalnotes = require('../../modules/order/internalnotes');
const documents = require('../../modules/order/documents');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

/*
 * all routes
 */
function getOrderCommentRoutes(){
    const router = express.Router();
    router.post('/comments/create', createComment);
    //router.get('/comments/getall', getAllComments);
    router.post('/internalnotes/create', createInternalNote);
    //router.get('/internalnotes/getall', getAllInternalNotes);
    router.get('/data/getall', getAllData);
    router.post('/document/upload', upload.single('file'), uploadDocument);
    router.get('/document/download', downloadDocument);
    //router.get('/document/getall', getAllDocuments);
    return router;
}
module.exports.getOrderCommentRoutes = getOrderCommentRoutes;


/*
 * gets all data for a particular appraisal
 */
async function getAllData(req, res) {
    let allData = await order.getAllData(req.query.token, req.query.appraisalID);
    if(allData === false){
        res.json({
            code: 20,
            contents: {},
            message: "error retrieving data.",
        });
        return;
    }
    res.json({
        code: 0,
        contents: allData,
        message: "",
    });
    return;
}


/*
 * uploads new document
 */
async function uploadDocument(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.body.token);
    if(user === false){
        res.status(401).send("no access");
        return;
    }

    // upload to s3 and mysql
    let body = {
        token: req.body.token,
        appraisalID: req.body.appraisalID,
        documentType: req.body.documentType,
        fileName: req.file.originalname,
        clientAccess: req.body.clientAccess,
        appraiserAccess: req.body.appraiserAccess,
        fileBuffer: req.file.buffer,
    }
    let documentID = await documents.uploadDocument(body);
    if(documentID !== false){
        res.json({
            code: 0,
            contents: documentID
        });
    } else{
        res.json({
            code: 10,
            contents: ""
        });
    }
}

/*
 * gets pdf
 */
async function downloadDocument(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.query.token);
    if(user === false){
        res.status(401).send("no access");
        return;
    }

    //let download = req.query.download;
    let download = true;

    // get document contents
    let token = req.query.token;
    let docID = req.query.docID;
    let fileData = await documents.getFileContents(token, docID);
    if(fileData !== false){
        // res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', fileData.contents.length);
        if(download === true){
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileData.fileName);
        } else{
            res.setHeader('Content-Disposition', 'filename=' + fileData.fileName);
        }
        return res.end(fileData.contents);
    } else{
        // send empty PDF that shows error
        res.send('');
    }
}




/*
 * creates new comment
 */
async function createComment(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.body.token);
    if(user === false){
        res.status(401).json({
            code: 20,
            contents: '',
            message: "no access"
        });
        return;
    }

    // save comment in mysql
    let commentID = await comments.createComment(req.body);
    if(commentID === false){
        res.json({
            code: 10,
            contents: commentID,
            message: ''
        });

    } else{
        res.json({
            code: 0,
            contents: commentID,
            message: ''
        });
    }
}


/*
 * get all comments for this order
 */
/*async function getAllComments(req, res) {
    let allComments = await comments.getAllComments(req.query.token, req.query.appraisalID);
    if(allComments === false){
        res.json({
            code: 20,
            contents: [],
            message: "error retrieving comments.",
        });
        return;
    }
    res.json({
        code: 0,
        contents: allComments,
        message: "",
    });
    return;
}*/



/*
 * creates new internal note
 */
async function createInternalNote(req, res) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(req.body.token);
    if(user === false){
        res.status(401).json({
            code: 20,
            contents: '',
            message: "no access"
        });
        return;
    }

    // save note in mysql
    let noteID = await internalnotes.createInternalNote(req.body);
    if(noteID === false){
        res.json({
            code: 10,
            contents: noteID,
            message: ''
        });

    } else{
        res.json({
            code: 0,
            contents: noteID,
            message: ''
        });
    }
}


/*
 * get all internal notes for this order
 */
/*async function getAllInternalNotes(req, res) {
    let allInternalNotes = await internalnotes.getAllInternalNotes(req.query.token, req.query.appraisalID);
    if(allInternalNotes === false){
        res.json({
            code: 20,
            contents: [],
            message: "error retrieving internal notes.",
        });
        return;
    }
    res.json({
        code: 0,
        contents: allInternalNotes,
        message: "",
    });
    return;
}*/
