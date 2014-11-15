var pg = require('pg');


exports.register = function (plugin, options, next) {

    plugin.ext('onPreHandler', function (request, extNext) {

        pg.connect(options.connectionString, function (err, client, done) {

            if (err) {
                next(err);
            }

            request.pg = {
                client: client,
                done: done,
                kill: false
            };

            extNext();
        });
    });

    plugin.events.on('tail', function (request, err) {

        if (request.pg) {
            request.pg.done(request.pg.kill);
        }
    });

    next();
};


exports.register.attributes = {
    pkg: require('./package.json')
};
