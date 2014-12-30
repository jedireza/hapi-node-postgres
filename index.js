var Hoek = require('hoek');
var Pg = require('pg');


var DEFAULTS = {
    connectionString: undefined,
    native: false,
    attach: 'onPreHandler',
    detach: 'tail'
};


exports.register = function (server, options, next) {

    var config = Hoek.applyToDefaults(DEFAULTS, options);

    if (config.native) {
        Pg = require('pg').native;
    }

    server.ext(config.attach, function (request, reply) {

        Pg.connect(config.connectionString, function (err, client, done) {

            if (err) {
                reply(err);
                return;
            }

            request.pg = {
                client: client,
                done: done,
                kill: false
            };

            reply.continue();
        });
    });


    server.on(config.detach, function (request, err) {

        if (request.pg) {
            request.pg.done(request.pg.kill);
        }
    });


    next();
};


exports.register.attributes = {
    pkg: require('./package.json')
};
