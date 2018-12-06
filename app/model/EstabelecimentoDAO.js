var dbConfig = require('../../config/dbConnection').dbConfig;
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;


var EstabelecimentoDAO = function (config) {
    this.configs = config;
}

EstabelecimentoDAO.prototype.criarEstabelecimento = function (usuario, cb) {

        mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

            if (err) {
                if (cb) return cb(err);
                else throw new Error({ err: err, err2: 'Expected a callback' });
            }

            client.db().collection("ESTABELECIMENTOS").insertOne(usuario, function (err, result) {

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

EstabelecimentoDAO.prototype.buscarEstabelecimentos = function (params, cb) {

    mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

        if (err) {
            if (cb) return cb(err);
            else throw new Error({ err: err, err2: 'Expected a callback' });
        }


        client.db().collection("ESTABELECIMENTOS").find(params, { collation: { locale: 'pt', strength: 2 } }).toArray( function (err, result) {

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

EstabelecimentoDAO.prototype.atualizarEstabelecimentos = function (query, dados, cb) {

    mongodb.connect(this.configs, { useNewUrlParser: true }, function (err, client) {

        if (err) {
            if (cb) return cb(err);
            else throw new Error({ err: err, err2: 'Expected a callback' });
        }

        var newValues = { $set: dados };

        client.db().collection("ESTABELECIMENTOS").updateOne(query, newValues, function (err, result) {

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

function dbFactory(dbConfig) {
        return new EstabelecimentoDAO(dbConfig);
}

exports.EstabelecimentoDAO = dbFactory(dbConfig);

