const request = require('./request/http_request');

/*
 * sends the actual login request to server
 */
async function sendRequest(email, pass){
    let body = {
        Email: email,
        Password: pass
    }
    return await request.post('/login', body)
}
module.exports.sendRequest = sendRequest;


/*
 * saves first user
 */
async function saveFirstUser(body){
    return await request.post('/firstuser', body)
}
module.exports.saveFirstUser = saveFirstUser;
