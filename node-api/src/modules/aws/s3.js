const AWS = require('aws-sdk');

/*
 * init s3
 */
function initS3(params){
    return new AWS.S3({
        accessKeyId: params.ID,
        secretAccessKey: params.SECRET
    });
}
module.exports.initS3 = initS3;


/*
 * upload file to s3
 */
async function uploadFile(s3, bucketName, key, fileContent){
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent
    };

    return new Promise(async function(resolve) {
        s3.upload(params, function(err, data) {
            if (err) {
                resolve(false);
            }
            resolve(data);
        });
    })
};
module.exports.uploadFile = uploadFile;


/*
 * upload file to s3
 */
async function getFile(s3, bucketName, key){
    const params = {
        Bucket: bucketName,
        Key: key
    };

    return new Promise(async function(resolve) {
        s3.getObject(params, function(err, data) {
            if (err) {
                resolve(false);
            }
            resolve(data.Body);
        })
    })
};
module.exports.getFile = getFile;
