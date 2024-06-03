const maria = require('../database/mariadb');
const firebase = require('../database/firebase');
// const crypto = require('../utils/crypto');


/*
 * create internal note in sql
 */
async function createInternalNote(note){
    let user = await firebase.verifyFirebaseToken(note.token);
    if(user === false){
        return false;
    }

    // save in sql
    note.userID = user.uid; // set user_id from firebase id
    let sqlResults = await saveInternalNoteSql(note);
    return sqlResults.insertId;
}
module.exports.createInternalNote = createInternalNote;


/*
 * creates internal note in sql
 */
async function saveInternalNoteSql(note){
    let insertStmt = 'INSERT INTO appraisal_internal_notes(appraisal_id, label_id, note_text, created_by_user_id, date_created) VALUES(?, ?, ?, ?, NOW())';
    let params = [note.appraisalID, note.labelID, note.noteText, note.userID];
    return await global.mariaPool.insert(insertStmt, params);
}


/*
 * returns all internal notes from an appraisal from sql
 */
async function getAllInternalNotes(token, appraisalID){
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get all internal notes for this appraisal
    let sqlStmt = `SELECT first_name, last_name, user_id, note_id, label_id, note_text,
                    created_by_user_id, DATE_FORMAT(appraisal_internal_notes.date_created, '%M %d, %Y, %h:%i:%s %p') AS date_created, appraisal_internal_notes.date_deleted
                FROM appraisal_internal_notes
                INNER JOIN users ON(appraisal_internal_notes.created_by_user_id = users.firebase_uid)
                WHERE appraisal_id=? AND organization_id=?
                ORDER BY date_created DESC`;
    let params = [appraisalID, user.organizationID];
    let rows = await global.mariaPool.query(sqlStmt, params);
    if(rows === false){
        return false;
    }
    return rows;
}
module.exports.getAllInternalNotes = getAllInternalNotes;
