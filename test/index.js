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

        const pluginWithConfig = {
            register: Plugin,
            options: {
                connectionString: 'postgres://postgres:mysecretpassword@localhost/hapi_node_postgres',
                native: true
            }
        };
        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.not.exist();
            done();
        });
    });

    lab.test('it return an error when options not contains `connectionString`', (done) => {

        const pluginWithConfig = {
            register: Plugin,
            options: {}
        };
        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.match(/ValidationError: child "connectionString" fails/);
            done();
        });
    });

    lab.test('it returns an error when the connection fails in the extension point', (done) => {

        const realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            callback(Error('connect failed'));
        };
        const pluginWithConfig = {
            register: Plugin,
            options: {
                connectionString: 'postgres://postgres:mysecretpassword@localhost/hapi_node_postgres'
            }
        };
        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.not.exist();

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(500);
                stub.pg.connect = realConnect;

                done();
            });
        });
    });


    lab.test('it successfully returns when the connection succeeds in extension point', (done) => {

        const realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            const returnClient = () => {};

            callback(null, {}, returnClient);
        };
        const pluginWithConfig = {
            register: Plugin,
            options: {
                connectionString: 'postgres://postgres:mysecretpassword@localhost/hapi_node_postgres'
            }
        };
        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.not.exist();

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                stub.pg.connect = realConnect;

                done();
            });
        });
    });


    lab.test('it successfully cleans up during the server tail event', (done) => {

        const realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            const returnClient = function (killSwitch) {

                Code.expect(killSwitch).to.equal(true);
                stub.pg.connect = realConnect;

                done();
            };

            callback(null, {}, returnClient);
        };
        const pluginWithConfig = {
            register: Plugin,
            options: {
                connectionString: 'postgres://postgres:mysecretpassword@localhost/hapi_node_postgres'
            }
        };
        server.register(pluginWithConfig, (err) => {

            Code.expect(err).to.not.exist();

            request.url = '/?kill=true';

            server.inject(request, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                stub.pg.connect = realConnect;
            });
        });
    });


    lab.test.only('it successfully uses native bindings without error', (done) => {

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
