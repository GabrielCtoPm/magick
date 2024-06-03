const express = require('express');
const admin = require('firebase-admin');
const firebase = require('../modules/database/firebase');
const users = require('../modules/users/user');

/*
 * all routes
 */
function getAuthenticationRoutes(){
    const router = express.Router();
    //router.post('/register', register);
    router.post('/password/reset', changeMyPassword); // user changing their own password
    router.post('/admin/user/create', registerUser); // admin creating new user account
    router.post('/admin/user/edit', editUser); // admin changing account info
    router.post('/admin/user/deactivate', deactivateUser); // admin deactivating account
    router.post('/admin/user/reactivate', activateUser); // admin activating account
    router.post('/admin/password/change', changePassword); // admin changing password
    router.get('/getall', getAllUsers);
    return router;
}
module.exports.getAuthenticationRoutes = getAuthenticationRoutes;


/*
 * registers new user
 */
async function registerUser(req, res) {
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

    // save user info in firebase/mysql
    let userID = await users.createUser(req.body);
    if(userID === false){
        res.json({
            code: 10,
            contents: userID,
            message: ''
        });

    } else{
        res.json({
            code: 0,
            contents: userID,
            message: ''
        });
    }
}


/*
 * user changing their own password
 */
async function changeMyPassword(req, res) {
    let body = {
        newPass: req.body.newPass,
        confirmPass: req.body.confirmPass,
        token: req.body.token,
    }

    let sqlStatus = await users.changePassword(body);
    if(sqlStatus === false){
        res.json({
            code: 20,
            contents: "could not authenticate user"
        });
        return;
    } else if(sqlStatus.affectedRows === 1){
        res.json({
            code: 0,
            contents: "success"
        });
        return;
    }
    res.json({
        code: 20,
        contents: "error saving password"
    });
}


/*
 * admin changing another user's password
 */
async function changePassword(req, res) {
    let body = {
        newPass: req.body.newPass,
        confirmPass: req.body.confirmPass,
        token: req.body.token,
        userID: req.body.userID
    }

    let sqlStatus = await users.changePassword(body, body.userID);
    if(sqlStatus === false){
        res.json({
            code: 20,
            contents: "could not authenticate user"
        });
        return;
    } else if(sqlStatus.affectedRows === 1){
        res.json({
            code: 0,
            contents: "success"
        });
        return;
    }
    res.json({
        code: 20,
        contents: "error saving password"
    });
}


/*
 * get all usrs for this organization
 */
async function getAllUsers(req, res) {
    let allUsers = await users.getAllUsers(req.query.token);
    if(allUsers === false){
        res.json({
            code: 20,
            contents: [],
            message: "error retrieving users.",
        });
        return;
    }
    res.json({
        code: 0,
        contents: allUsers,
        message: "",
    });
    return;
}


/*
 * edits user account info from admin
 */
async function editUser(req, res){
    let success = await users.editUser(req.body);
    if(success.affectedRows === 1){
        res.json({
            code: 0,
            contents: true,
            message: "",
        });
        return;
    }
    if(success === false){
        res.json({
            code: 20,
            contents: false,
            message: "error updating user account.",
        });
        return;
    }
    res.json({
        code: 30,
        contents: false,
        message: "error updating user account.",
    });
}


/*
 * deactivates user account firebase/mysql
 */
async function deactivateUser(req, res){
    let success = await users.deactivateUser(req.body);
    if(success.affectedRows === 1){
        res.json({
            code: 0,
            contents: true,
            message: "",
        });
        return;
    }
    if(success === false){
        res.json({
            code: 20,
            contents: false,
            message: "error deactivating user account.",
        });
        return;
    }
    res.json({
        code: 30,
        contents: false,
        message: "error deactivating user account.",
    });
}


/*
 * activates account firebase/mysql
 */
async function activateUser(req, res){
    let success = await users.activateUser(req.body);
    if(success.affectedRows === 1){
        res.json({
            code: 0,
            contents: true,
            message: "",
        });
        return;
    }
    if(success === false){
        res.json({
            code: 20,
            contents: false,
            message: "error activating user account.",
        });
        return;
    }
    res.json({
        code: 30,
        contents: false,
        message: "error activating user account.",
    });
}
