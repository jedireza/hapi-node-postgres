var pg = require('pg');


exports.register = function (server, options, next) {

    server.ext('onPreHandler', function (request, reply) {

        pg.connect(options.connectionString, function (err, client, done) {

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


    server.on('tail', function (request, err) {

        if (request.pg) {
            request.pg.done(request.pg.kill);
        }
    });


    next();
};


exports.register.attributes = {
    pkg: require('./package.json')
};
