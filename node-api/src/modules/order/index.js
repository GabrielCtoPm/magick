const comments = require('./comments');
const internalnotes = require('./internalnotes');
const documents = require('./documents');
// const crypto = require('../utils/crypto');


/*
 * get all data for an appraisal (comments, internal notes, documents, etc)
 */
async function getAllData(token, appraisalID){
    let allComments = await comments.getAllComments(token, appraisalID);
    if(allComments === false){
        return false;
    }

    let allInternalNotes = await internalnotes.getAllInternalNotes(token, appraisalID);
    if(allInternalNotes === false){
        return false;
    }

    let allDocuments = await documents.getAllDocuments(token, appraisalID);
    if(allDocuments === false){
        return false;
    }

    return {
        comments: allComments,
        internalNotes: allInternalNotes,
        documents: allDocuments,
    }
}
module.exports.getAllData = getAllData;
