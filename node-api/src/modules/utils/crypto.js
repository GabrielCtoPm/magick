const crypto = require('crypto');
const bcrypt = require('bcrypt');

const algorithm = 'aes-256-gcm';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

const encrypt = (str) => {
    const iv = new crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    let enc1 = cipher.update(str, 'utf8');
    let enc2 = cipher.final();
    return Buffer.concat([enc1, enc2, iv, cipher.getAuthTag()]).toString("base64");
};

const decrypt = (enc) => {
    enc = Buffer.from(enc, "base64");
    const iv = enc.slice(enc.length - 28, enc.length - 16);
    const tag = enc.slice(enc.length - 16);
    enc = enc.slice(0, enc.length - 28);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    decipher.setAuthTag(tag);
    let str = decipher.update(enc, null, 'utf8');
    str += decipher.final('utf8');
    return str;
};


async function saltPassword(password){
    const saltRounds = 10;
    return new Promise(async function(resolve) {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            resolve(hash);
        });
    });
}

async function passwordsMatch(password, hashPass){
    return new Promise(async function(resolve) {
        bcrypt.compare(password, hashPass, function(err, result) {
            resolve(result);
        });
    });
}


module.exports = {
    encrypt,
    decrypt,
    saltPassword,
    passwordsMatch
};
