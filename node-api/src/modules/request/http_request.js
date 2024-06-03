//const got = require('got');
const ky = require('ky');

var cookie = undefined;
var hostname = 'http://54.156.157.168:';
//var hostname = 'http://localhost:';
var PORT = 80;

/*
 * makes post request to terminus
 */
async function post(endpoint, body, timeout){
    // console.log(body);
    // make empty json string as body
    if(body === null){
        body = "{}";
    }
    if(timeout === undefined){
        timeout = 5000;
    }

    let options = {
        headers: {
            'Content-type': 'application/json',
            'Cookie': cookie
        },
        timeout: timeout,
        keepAliveTimeout: timeout,
        retry: 0,
        keepAlive: false,
        body: JSON.stringify(body)
    };

    //console.log(ky.default)

    // return await ky.post(`http://localhost:` + port + endpoint, options)
    return await ky.default.post(hostname + PORT + endpoint, options)
        .then((response) => {
            let cookieRes = response.headers['set-cookie']
            if (cookieRes) cookie = cookieRes
            return JSON.parse(response.body);
        })
        .catch(error => {
            console.log("post error -> " + error);
            if (error instanceof ky.HTTPError) {
                let statusCode = error.response.statusCode;
                if (statusCode == 401 || statusCode == 403) {
                    console.log("auth fail");
                    if (window.location.hash != '#/login')
                        window.location.hash = '#/login'
                }
            }
            return false;
        });
}
module.exports.post = post


/*
 * makes get request to terminus
 */
async function get(endpoint, getParams, timeout){
    if(timeout === undefined){
        timeout = 10000;
    }

    // only convert query if params are set
    let query = "";
    if(getParams !== undefined){
        query = objectToQuery(getParams);
    }

    let options = {
        headers: {
            'Cookie': cookie
        },
        timeout: timeout,
        keepAliveTimeout: timeout,
        retry: 0,
        keepAlive: false
    };

    return await ky.default.get(hostname + PORT + endpoint + "?" + query, options)
        .then((response) => {
            let cookieRes = response.headers['set-cookie']
            if (cookieRes) cookie = cookieRes
            return JSON.parse(response.body);
        })
        .catch(error => {
            console.log("get error -> " + endpoint + " - " + error);
            if (error instanceof ky.HTTPError) {
                let statusCode = error.response.statusCode;
                if (statusCode == 401 || statusCode == 403) {
                    console.log("auth fail");
                    if (window.location.hash != '#/login')
                        window.location.hash = '#/login'
                }
            }
            return false;
        });
}
module.exports.get = get


/*
 * converts javascript object to get query
 */
function objectToQuery(object){
    return Object.keys(object).map(key => key + '=' + encodeURIComponent(object[key])).join('&');
}
