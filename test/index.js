var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');
var Proxyquire = require('proxyquire');


var stub = {
    pg: {}
};
var Plugin = Proxyquire('../', {
    'pg': stub.pg
});
var lab = exports.lab = Lab.script();
var request, server;


lab.beforeEach(function (done) {

    server = new Hapi.Server();
    server.connection({ port: 0 });
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            if (request.query.kill) {
                request.pg.kill = true;
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


lab.experiment('Postgres Plugin', function () {

    lab.test('it registers the plugin', function (done) {

        server.register(Plugin, function (err) {

            Code.expect(err).to.not.exist();
            done();
        });
    });


    lab.test('it returns an error when the connection fails in the pre handler extension point', function (done) {

        var realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            callback(Error('connect failed'));
        };

        server.register(Plugin, function (err) {

            Code.expect(err).to.not.exist();
        });

        server.inject(request, function (response) {

            Code.expect(response.statusCode).to.equal(500);
            stub.pg.connect = realConnect;

            done();
        });
    });


    lab.test('it successfully returns when the connection succeeds in the pre handler extension point', function (done) {

        var realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            var returnClient = function () {};

            callback(null, {}, returnClient);
        };

        server.register(Plugin, function (err) {

            Code.expect(err).to.not.exist();
        });

        server.inject(request, function (response) {

            Code.expect(response.statusCode).to.equal(200);
            stub.pg.connect = realConnect;

            done();
        });
    });


    lab.test('it successfully cleans up during the server tail event', function (done) {

        var realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            var returnClient = function (killSwitch) {

                Code.expect(killSwitch).to.equal(true);
                stub.pg.connect = realConnect;

                done();
            };

            callback(null, {}, returnClient);
        };

        server.register(Plugin, function (err) {

            Code.expect(err).to.not.exist();
        });

        request.url = '/?kill=true';

        server.inject(request, function (response) {

            Code.expect(response.statusCode).to.equal(200);
            stub.pg.connect = realConnect;
        });
    });


    lab.test('it successfully uses native bindings without error', function (done) {

        var realConnect = stub.pg.connect;
        stub.pg.connect = function (connection, callback) {

            var returnClient = function () {};

            callback(null, {}, returnClient);
        };

        var pluginWithConfig = {
            register: Plugin,
            options: {
                native: true
            }
        };

        server.register(pluginWithConfig, function (err) {

            Code.expect(err).to.not.exist();
        });

        server.inject(request, function (response) {

            Code.expect(response.statusCode).to.equal(200);
            stub.pg.connect = realConnect;

            done();
        });
    });
});
