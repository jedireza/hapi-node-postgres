'use strict';

const Hoek = require('hoek');
let Pg = require('pg');


const DEFAULTS = {
    connectionString: undefined,
    native: false,
    attach: 'onPreHandler',
    detach: 'response'
};

exports.plugin = {  
    register: (server, options) => {

        const config = Hoek.applyToDefaults(DEFAULTS, options);
    
        if (config.native) {
            Pg = require('pg').native;
        }
    
        server.expose('connect', Pg.connect.bind(Pg, config.connectionString));
    
        server.ext(config.attach, (request, h) => {
            return Pg
                .connect(config.connectionString)
                .then(client => {
                    
                    request.pg = {
                        client,
                        done: client.release,
                        kill: false
                    };
                    
                    return h.continue

                });
        });

        server.events.on(config.detach, (request, err) => {
    
            if (request.pg) {
                request.pg.done(request.pg.kill);
            }
        });
    },
    pkg: require('./package.json')
}
