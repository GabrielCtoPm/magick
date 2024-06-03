const maria = require('../database/mariadb');
const firebase = require('../database/firebase');
// const crypto = require('../utils/crypto');


/*
 * create comment in sql
 */
async function createComment(commentInfo){
    let user = await firebase.verifyFirebaseToken(commentInfo.token);
    if(user === false){
        return false;
    }

    // save in sql
    commentInfo.userID = user.uid; // set user_id from firebase id
    commentInfo.userType = 1; // TODO -> need to replace with proper user 1=amc, 2=appraiser, 3=client
    let sqlResults = await saveCommentSql(commentInfo);
    return sqlResults.insertId;
}
module.exports.createComment = createComment;


/*
 * creates comment in mysql
 */
async function saveCommentSql(comment){
    let insertStmt = 'INSERT INTO appraisal_comments(appraisal_id, label_id, comment_text, is_read, client_access, appraiser_access, order_type, created_by_user_id, date_created) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    let params = [comment.appraisalID, comment.labelID, comment.commentText, comment.isRead, comment.clientAccess, comment.appraiserAccess, comment.userID];
    return await global.mariaPool.insert(insertStmt, params);
}


/*
 * returns all comments from sql
 */
async function getAllComments(token, appraisalID){
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get all comment for this organization
    let sqlStmt = `SELECT first_name, last_name, user_id, comment_id, label_id, comment_text, is_read, client_access, appraiser_access, user_type,
                    created_by_user_id, DATE_FORMAT(appraisal_comments.date_created, '%M %d, %Y, %h:%i:%s %p') AS date_created, appraisal_comments.date_deleted
                FROM appraisal_comments
                INNER JOIN users ON(appraisal_comments.created_by_user_id = users.firebase_uid)
                WHERE appraisal_id=? AND organization_id=?
                ORDER BY date_created DESC`;
    let params = [appraisalID, user.organizationID];
    let rows = await global.mariaPool.query(sqlStmt, params);
    if(rows === false){
        return false;
    }
    return rows;
}
module.exports.getAllComments = getAllComments;
