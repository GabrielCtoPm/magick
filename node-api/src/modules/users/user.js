const admin = require('firebase-admin');
const maria = require('../database/mariadb');
const firebase = require('../database/firebase');
const crypto = require('../utils/crypto');

class User{
    constructor(userInfo){
        if(userInfo !== undefined){
            this.UserID = userInfo.UserID;
            this.FirstName = userInfo.FirstName;
            this.LastName = userInfo.LastName;
            this.Email = userInfo.Email;
            this.Phone = userInfo.Phone;
            this.OrganizationID = userInfo.OrganizationID;
            this.AccountType = userInfo.AccountType;
            this.DateCreated = userInfo.DateCreated;
            userInfo.DateDeleted = userInfo.DateDeleted;
        }
    }

    async create(dbConn){
        let insertStmt = 'INSERT INTO users(first_name, last_name, email, phone, account_type, organization_id, date_created) VALUES(?, ?, ?, ?, ?, ?, NOW())';
        let params = [this.FirstName, this.LastName, this.Email, this.Phone, this.AccountType, this.OrganizationID];
        return await maria.insert(insertStmt, params, dbConn, true);
    }

}
module.exports.User = User;


/*
 * create user in firebase/sql
 */
async function createUser(userInfo){
    // verify user that's sending request
    let user = await firebase.verifyFirebaseToken(userInfo.token);
    if(user === false){
        return false;
    }

    // save in firebase
    let firebaseUser = await firebase.createUser(userInfo);
    if(firebaseUser === false){
        return false;
    }

    userInfo.userID = firebaseUser.uid; // set user_id from firebase id
    userInfo.accountType = 4; // access control, need to set role from frontend
    userInfo.organizationID = user.organizationID; // same orgID as user saving

    // update info for account
    let updateUser = await firebase.updateUser(userInfo);
    if(updateUser === false){
        return false;
    }

    // set organiztion and account type for a user (upon registration)
    let contents = await setAdminInfo(userInfo);
    if(contents === false){
        return false;
    }

    // verify email
    await firebaseUser.sendEmailVerification();

    // save in sql
    let sqlResults = await saveUserSql(userInfo);

    return firebaseUser.uid;
}
module.exports.createUser = createUser;


/*
 * sets organiztionID and account type for a user
 */
async function setAdminInfo(userInfo){
    return await admin.auth()
      .setCustomUserClaims(userInfo.userID, {
          organizationID: userInfo.organizationID,
          accountType: userInfo.accountType,
      })
      .then((response) => {
          //console.log(response)
          return true;
      })
      .catch(error => {
          //console.log(error);
          return false;
      });
}
module.exports.setAdminInfo = setAdminInfo;


/*
 * creates user in mysql
 */
async function saveUserSql(userInfo){
    let hash = await crypto.saltPassword(userInfo.newPass);
    if(hash === undefined){
        return false;
    }
    let insertStmt = 'INSERT INTO users(first_name, last_name, email, phone, password, firebase_uid, account_type, organization_id, date_created) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    let params = [userInfo.firstName, userInfo.lastName, userInfo.email, userInfo.phone, hash, userInfo.userID, userInfo.accountType, userInfo.organizationID];
    return await global.mariaPool.insert(insertStmt, params);
}


/*
 * returns all users from sql
 */
async function getAllUsers(token){
    // verify user
    let user = await firebase.verifyFirebaseToken(token);
    if(user === false){
        return false;
    }

    // get all users for this organization
    let sqlStmt = "SELECT firebase_uid, first_name, last_name, email, phone, account_type, organization_id, DATE_FORMAT(date_created, '%M %d, %Y, %h:%i:%s %p') AS date_created, date_deleted FROM users WHERE organization_id=?";
    let params = [user.organizationID];
    let rows = await global.mariaPool.query(sqlStmt, params);
    if(rows === false){
        return false;
    }
    return rows;
}
module.exports.getAllUsers = getAllUsers;



/*
 * changes user password for firebase/mysql
 */
async function changePassword(body, userID){
    // passwords must equal
    if(body.newPass !== body.confirmPass){
        return false;
    }

    // verify user
    let user = await firebase.verifyFirebaseToken(body.token);
    if(user === false){
        return false;
    }

    // needs proper permissions
    if(user.accountType !== 2){
        return false;
    }

    if(userID === undefined){
        userID = user.uid;
    }

    // update password in firebase
    let success = await firebase.updatePassword(userID, body.newPass);
    if(success === false){
        return false;
    }

    // hash password and update in sql
    let hash = await crypto.saltPassword(body.newPass);
    if(hash === undefined){
        return false;
    }

    let updateStmt = "UPDATE users SET password=? WHERE firebase_uid=? AND organization_id=?";
    let params = [hash, userID, user.organizationID];
    return await global.mariaPool.insert(updateStmt, params);
}
module.exports.changePassword = changePassword;


/*
 * changes user info for firebase/mysql
 */
async function editUser(body){
    if(body.firstName === ''){
        return false;
    }
    if(body.lastName === ''){
        return false;
    }
    if(body.email === ''){ // need to validate email format
        return false;
    }
    if(body.phone === ''){ // need to validate phone format
        return false;
    }

    // verify user
    let user = await firebase.verifyFirebaseToken(body.token);
    if(user === false){
        return false;
    }

    // needs proper permissions
    if(user.accountType !== 5){
        return false;
    }

    // update password in firebase
    let success = await firebase.updateUser(body);
    if(success === false){
        return false;
    }

    let updateStmt = "UPDATE users SET first_name=?, last_name=?, email=?, phone=? WHERE firebase_uid=? AND organization_id=?";
    let params = [body.firstName, body.lastName, body.email, body.phone, body.userID, user.organizationID];
    return await global.mariaPool.insert(updateStmt, params);
}
module.exports.editUser = editUser;


/*
 * deactivates user account for firebase/mysql
 */
async function deactivateUser(body){
    // verify user
    let user = await firebase.verifyFirebaseToken(body.token);
    if(user === false){
        return false;
    }

    // don't allow people to deactivate themselves
    if(body.userID === user.uid){
        return false;
    }

    // needs proper permissions
    if(user.accountType !== 5){
        return false;
    }

    // update password in firebase
    let success = await firebase.disableUser(body.userID, true);
    if(success === false){
        return false;
    }

    let updateStmt = "UPDATE users SET date_deleted=NOW() WHERE firebase_uid=? AND organization_id=?";
    let params = [body.userID, user.organizationID];
    return await global.mariaPool.insert(updateStmt, params);
}
module.exports.deactivateUser = deactivateUser;


/*
 * activates user account for firebase/mysql
 */
async function activateUser(body){
    // verify user
    let user = await firebase.verifyFirebaseToken(body.token);
    if(user === false){
        return false;
    }

    // needs proper permissions
    if(user.accountType !== 5){
        return false;
    }

    // update password in firebase
    let success = await firebase.disableUser(body.userID, false);
    if(success === false){
        return false;
    }

    let updateStmt = "UPDATE users SET date_deleted=NULL WHERE firebase_uid=? AND organization_id=?";
    let params = [body.userID, user.organizationID];
    return await global.mariaPool.insert(updateStmt, params);
}
module.exports.activateUser = activateUser;
