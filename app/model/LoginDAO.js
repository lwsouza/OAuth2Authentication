var dbConfig = require('../../config/dbConnection').dbConfig;
var dbControl = require('../../config/dbConnection').dbControl;
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;


var LoginDAO = function (config) {
    this.configs = config;
}

LoginDAO.prototype.criarToken = function (dadosLogin, cb) {

    mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

        if (err) {
            if (cb) return cb(err);
            else throw new Error({ err: err, err2: 'Expected a callback' });
        }

        client.db().collection("OAUTH").insertOne(dadosLogin, function (err, result) {

            if (err) {
                console.log(err);
                if (cb) return cb(err);
                else throw new Error({ err: err, err2: 'Expected a callback' });
            }

            data = result.ops ? result.ops : [];

            cb(err, data);

            client.close();
        });
    })
}

LoginDAO.prototype.buscarToken = function (token, cb) {

    mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

        if (err) {
            if (cb) return cb(err);
            else throw new Error({ err: err, err2: 'Expected a callback' });
        }

        client.db().collection("OAUTH").find({ "token": token }, { collation: { locale: 'pt', strength: 2 } }).toArray(function (err, result) {

            if (err) {
                console.log(err);
                if (cb) return cb(err);
                else throw new Error({ err: err, err2: 'Expected a callback' });
            }

            data = result ? result : [];

            cb(err, data);

            client.close();
        });
    })
}

LoginDAO.prototype.deleteToken = function (token, cb) {

    mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

        if (err) {
            if (cb) return cb(err);
            else throw new Error({ err: err, err2: 'Expected a callback' });
        }

        client.db().collection("OAUTH").deleteOne({ "token": token }, { collation: { locale: 'pt', strength: 2 } }, function (err, result) {

            if (err) {
                console.log(err);
                if (cb) return cb(err);
                else throw new Error({ err: err, err2: 'Expected a callback' });
            }

            data = result ? result : [];

            cb(err, data);

            client.close();
        });
    })
}


function dbFactory(dbConfig) {
    return new LoginDAO(dbConfig);
}

exports.LoginDAO = dbFactory(dbConfig);

