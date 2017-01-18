'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Proxyquire = require('proxyquire');


const stub = {
    pg: {}
};
const Plugin = Proxyquire('../', {
    'pg': stub.pg
});
const lab = exports.lab = Lab.script();
let request;
let server;


lab.beforeEach((done) => {

    server = new Hapi.Server();
    server.connection({ port: 0 });
    server.route({
        method: 'GET',
        path: '/',
        handler: function (req, reply) {

            if (req.query.kill) {
                req.pg.kill = true;
            }

            reply('hapi-node-postgres, at your service');
        }
    });

    request = {
        method: 'GET',
        url: '/'
    };

    done();
});


lab.experiment('Postgres Plugin', () => {

    lab.test('it registers the plugin', (done) => {

        const realConnect = stub.pg.connect;

        stub.pg.connect = function (connection, callback) {

            stub.pg.connect = realConnect;

            callback(null, {}, () => {});
        };

        server.register(Plugin, (err) => {

            Code.expect(err).to.not.exist();

            done();
        });
    });


    lab.test('it exposes a connect function', (done) => {

        const realConnect = stub.pg.connect;

        stub.pg.connect = function (connection, callback) {

            stub.pg.connect = realConnect;

            callback(null, {}, () => {

                done();
            });
        };

        server.register(Plugin, (err) => {

            const plugin = server.plugins['hapi-node-postgres'];

            Code.expect(err).to.not.exist();
            Code.expect(plugin.connect).to.be.a.function();

            plugin.connect((err, client, clientDone) => {

                Code.expect(err).to.not.exist();
                Code.expect(client).to.be.an.object();
                Code.expect(done).to.be.a.function();

                clientDone();
            });
        });
    });


    lab.test('it returns an error when the connection fails in the extension point', (done) => {

        const realConnect = stub.pg.connect;

        stub.pg.connect = function (connection, callback) {

            stub.pg.connect = realConnect;

            callback(Error('connect failed'));
        };

        server.register(Plugin, (err) => {

            Code.expect(err).to.not.exist();

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(500);

                done();
            });
        });
    });


    lab.test('it successfully returns when the connection succeeds in extension point', (done) => {

        const realConnect = stub.pg.connect;

        stub.pg.connect = function (connection, callback) {

            const returnClient = () => {};

            stub.pg.connect = realConnect;

            callback(null, {}, returnClient);
        };

        server.register(Plugin, (err) => {

            Code.expect(err).to.not.exist();

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(200);

                done();
            });
        });
    });


    lab.test('it successfully cleans up during the server tail event', (done) => {

        const realConnect = stub.pg.connect;

        stub.pg.connect = function (connection, callback) {

            const returnClient = function (killSwitch) {

                Code.expect(killSwitch).to.equal(true);

                done();
            };

            stub.pg.connect = realConnect;

            callback(null, {}, returnClient);
        };

        server.register(Plugin, (err) => {

            Code.expect(err).to.not.exist();

            request.url = '/?kill=true';

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                stub.pg.connect = realConnect;
            });
        });
    });


    lab.test('it successfully uses native bindings without error', (done) => {

        const pluginWithConfig = {
            register: Plugin,
            options: {
                connectionString: 'postgres://postgres:mysecretpassword@localhost/hapi_node_postgres',
                native: true
            }
        };

        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.not.exist();

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });
});
