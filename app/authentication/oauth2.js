var oauth2orize = require('oauth2orize');
var router = require('express').Router();
var server = oauth2orize.createServer();
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var EstabelecimentoDAO = require('../model/EstabelecimentoDAO').EstabelecimentoDAO;
var LoginDAO = require('../model/LoginDAO').LoginDAO;
var validatePassword = require('../utils/security').validatePassword;
var utils = require('../utils/oauthUtils');
var objectId = require('mongodb').ObjectId;

function saveToken(estab_id, estab_nome, usuario_id, name, scope, expiration, cb) {
	if (!cb) {
		return 'function must have a callback';
	}
	if (!estab_id) {
		return cb("Establishment ID should not be null");
	}
	if (!estab_nome) {
		return cb("Establishment name should not be null");
	}
	if (!usuario_id) {
		return cb("User ID should not be null");
	}
	if (!name) {
		return cb("Name should not be null");
	}
	if (!scope) {
		return cb("Scope should not be null");
	}

	token = utils.generateToken(name);

	var dadosLogin = {
		"token": token,
		"est_id": estab_id,
		"est_nome": estab_nome,
		"usuario_id": usuario_id,
		"usuario": name,
		"scope": scope,
		"expiracao": expiration,
		"criado": new Date()
	}


	LoginDAO.criarToken(dadosLogin, function (err, rows) {
		if (err) {
			console.log(err);
			return cb(err);
		}

		delete scope['database'];

		cb(null, name, token, scope, expiration);

	})
}

function findToken(token, cb) {
	if (!cb) {
		return new Error('function must have a callback');
	}
	if (!token) {
		return cb("Operator should not be null");
	}

	LoginDAO.buscarToken(token, function (err, rows) {
		if (err) {
			console.log(err);
			return cb(err);
		}

		var usuario = rows[0];

		cb(null, usuario.est_id, usuario.est_nome, usuario.usuario_id, usuario.usuario, usuario.scope, usuario.expiracao, usuario.criado);

	})

}

function deleteToken(token, cb) {
	if (!cb) {
		return new Error('function must have a callback');
	}

	LoginDAO.deleteToken(token, function (err, rows) {
		if (err) {
			return cb(err);
		}

		cb(null);
	});
}

var nativeAuthentication = function (client, username, password, scope, done) {

	if (username === null) done(null, null);
	if (scope[0] === null) done(null, null);
	var code = scope[0];

	var param_code = { database: code }

	EstabelecimentoDAO.buscarEstabelecimentos(param_code, function (err, rows) {

		if (err) {
			console.log(err)
			return done(null, false);
		}

		if (rows.length === 0) {
			return done(null, false);
		}


		var locked = rows[0]['bloqueado'];

		if (locked) {
			debugLog.log(code + " authentication locked.")
			return done(null, false);
		}

		var usuarios = rows[0].usuarios;

		var i = 0;

		usuarios.forEach(element => {

			if (element.email === username) {

				var hashedPass = element['senha'];

				if (!validatePassword(password, hashedPass)) {
					// updateLoginFails(username);
					return done(null, false);
				}

				scope = {
					permitedModels: rows[0].modulos,
					permissions: element.permissaoModulo,
					database: rows[0].database
				}

				saveToken(rows[0]._id, rows[0].nomeFantasia, element._id, element.nome, scope, 3600, function (err, nome, token, permission, expiration) {
					if (err) {
						console.log(err)
						return done(err);
					}

					done(null, token, null, { scope: JSON.stringify(permission) })

				});

				i++;
			}
		});

		if (i == 0) {
			done(null, false);
		}


	});
}


var authMethods = {
	native: nativeAuthentication
}

/**
 * OAUTH2 FUNCTIONS
 */

server.serializeClient(function (client, done) {
	return done(null, client.id);
});

server.deserializeClient(function (id, done) {
	return done(null, id);
});

server.exchange(oauth2orize.exchange.password(authMethods.native));

passport.use(new BearerStrategy({ passReqToCallback: true },
	function (req, accessToken, done) {

		findToken(accessToken, function (err, estab_id, estab_nome, usuario_id, name, scope, expiracao, criado) {
			if (err) {
				console.log(err);
				return done(null, false);
			}

			if (!name) {
				return done(null, false);
			}

			var data_atual = new Date();
			var data_exp = new Date(criado);
			data_exp.setSeconds(data_exp.getSeconds() + expiracao);

			//check if token is still valid
			if (data_atual > data_exp) {

				deleteToken(accessToken, function (err) {
					if (err) {
						debugLog.log(err);
					}
				});

				return done(null, false);
			}

			done(null, { estabID: estab_id, estabNome: estab_nome, userID: usuario_id, username: name }, scope);
		});
	}
));


router.post('/token', [server.token(), server.errorHandler()]);
exports.router = router;