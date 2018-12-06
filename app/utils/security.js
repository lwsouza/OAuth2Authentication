var crypto = require('crypto');

var conf = {
    iterations: 5000,
    outputBytes: 64,
    digest: 'sha512'
}

var hashPassword = function (password) {
    var pwd = crypto.pbkdf2Sync(password, password, conf.iterations, conf.outputBytes, conf.digest).toString('hex');

    return pwd
}

var validatePassword = function (password, hashed) {
    var pwd = crypto.pbkdf2Sync(password, password, conf.iterations, conf.outputBytes, conf.digest).toString('hex');

    ret = (hashed === pwd) ? true : false;

    return ret;
}

exports.hashPassword = hashPassword;
exports.validatePassword = validatePassword;