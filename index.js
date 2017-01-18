'use strict';
const Joi = require('joi');
const Hoek = require('hoek');
const Pkg = require('./package.json');
let Pg = require('pg');

const HAPI_SERVER_EVENTS = [
    'onRequest',
    'onPreAuth',
    'onPostAuth',
    'onPreHandler',
    'onPostHandler',
    'onPreResponse',
    'tail'
];

const internals = {
    options: Joi.object({
        connectionString: Joi.string().required(),
        native: Joi.boolean().default(false),
        attach: Joi.string().valid(HAPI_SERVER_EVENTS).default('onPreHandler'),
        detach: Joi.string().valid(HAPI_SERVER_EVENTS).default('tail')
    })
};

exports.register = function (server, options, next) {

    const validateOptions = internals.options.validate(options);

    if (validateOptions.error) {
        return next(validateOptions.error);
    }

    const config = Hoek.applyToDefaults(validateOptions.value, options);

    if (config.native) {
        Pg = require('pg').native;
    }

    Pg.connect(config.connectionString, (err, client) => {

        console.log(err);
        console.log(client);
        if (err) {
            server.log([Pkg.name], `Connection Error ${JSON.stringify(err)}`);
            return;
        }
        server.expose('pgClient', client);

    });

    server.ext(config.attach, (request, reply) => {

        Pg.connect(config.connectionString, (err, client, done) => {

            if (err) {
                reply(err);
                return;
            }

            request.pg = {
                client,
                done,
                kill: false
            };
            reply.continue();
        });
    });

    server.on(config.detach, (request, err) => {

        if (request.pg) {
            request.pg.done(request.pg.kill);
        }
    });


    next();
};


exports.register.attributes = {
    pkg: Pkg
};
