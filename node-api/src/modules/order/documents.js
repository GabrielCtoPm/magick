const express = require('express');
const firebase = require('../../modules/database/firebase');
const awsS3 = require('../../modules/aws/s3');
const config = require('../../config/aws_config.js');
const { v4: uuidv4 } = require('uuid');



/*
 * uploads pdf to mysql/s3
 */
async function uploadDocument(body) {
    let user = await firebase.verifyFirebaseToken(body.token);
    if(user === false){
        return false;
    }
    body.userID = user.uid;

    let s3 = awsS3.initS3(config.S3_TOKEN);

    let s3Key = user.organizationID + "/" + uuidv4(); // create uuid
    let bucketName = 'amc-documents';
    let success = await awsS3.uploadFile(s3, bucketName, s3Key, fileBuffer);
    if(success === false){
        return false;
    }

    // save in mysql
    let saveResults = await saveDocument(body);
    if(saveResults === false){
        return false;
    }
    return saveResults.insertId;
}
module.exports.uploadDocument = uploadDocument;


/*
 * creates document in mysql
 */
async function saveDocument(body){
    let insertStmt = `INSERT INTO appraisal_docs(appraisal_id, doc_path, doc_type, doc_name, client_access, appraiser_access, saved_by_user_id, date_saved)
        VALUES(?, ?, ?, ?, ?, ?, ?, NOW())`;
    let params = [body.appraisalID, body.s3Key, body.documentType, body.fileName, body.clientAccess, body.appraiserAccess, body.userID];
    return await global.mariaPool.insert(insertStmt, params);
}


/*
 * get list of documents from mysql
 */
async function getAllDocuments(token, appraisalID){
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get all documents for this organization
    let sqlStmt = `SELECT first_name, last_name, doc_id, doc_path, doc_type, doc_name, client_access, appraiser_access, saved_by_user_id,
                    DATE_FORMAT(appraisal_docs.date_saved, '%M %d, %Y, %h:%i:%s %p') AS date_saved, appraisal_docs.date_deleted
                FROM appraisal_docs
                INNER JOIN users ON(appraisal_docs.saved_by_user_id = users.firebase_uid)
                WHERE appraisal_id=? AND organization_id=?
                ORDER BY date_saved DESC`;
    let params = [appraisalID, user.organizationID];
    let rows = await global.mariaPool.query(sqlStmt, params);
    if(rows === false){
        return false;
    }
    return rows;
}
module.exports.getAllDocuments = getAllDocuments;



/*
 * gets raw contents of pdf
 */
async function getFileContents(token, docID) {
    // validate firebase
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get info from sql
    let documentData = await getDocumentSql(token, docID);
    if(documentData === false){
        return false;
    }

    // get contents from s3
    let s3 = awsS3.initS3(config.S3_TOKEN);
    let s3Key = documentData.doc_path;
    let bucketName = 'amc-documents';
    let contents = await awsS3.getFile(s3, bucketName, s3Key);
    if(contents !== false){
        return {
            fileName: documentData.doc_name,
            contents: contents
        };
    } else{
        return false;
    }
}
module.exports.getFileContents = getFileContents;



/*
 * get s3 path and approve access in sql
 */
async function getDocumentSql(token, docID){
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get doc_path in s3
    let sqlStmt = `SELECT doc_path, doc_name FROM appraisal_docs
                INNER JOIN users ON(appraisal_docs.saved_by_user_id = users.firebase_uid)
                WHERE doc_id=? AND organization_id=? LIMIT 1`;
    let params = [docID, user.organizationID];
    let rows = await global.mariaPool.query(sqlStmt, params);
    if(rows === false){
        return false;
    }
    if(rows.length === 0){
        return false;
    }
    return rows[0];
}
