# hapi-node-postgres

Wrap requests with a Postgres connection.

[![Build Status](https://travis-ci.org/jedireza/hapi-node-postgres.svg?branch=master)](https://travis-ci.org/jedireza/hapi-node-postgres)
[![Dependency Status](https://david-dm.org/jedireza/hapi-node-postgres/status.svg)](https://david-dm.org/jedireza/hapi-node-postgres)
[![devDependency Status](https://david-dm.org/jedireza/hapi-node-postgres/dev-status.svg)](https://david-dm.org/jedireza/hapi-node-postgres?type=dev)
[![peerDependency Status](https://david-dm.org/jedireza/hapi-node-postgres/peer-status.svg)](https://david-dm.org/jedireza/hapi-node-postgres?type=peer)

We use the [`pg`](https://github.com/brianc/node-postgres) (`node-postgres`)
module and take advantage of its connection pooling feature.

Note: Your project should have its own `pg` dependency installed. We depend on
`pg` via `peerDependencies`. If you elect to use native bindings you'll also
need to install the `pg-native` package.


## Install

```bash
$ npm install hapi-node-postgres
```


## Usage

### In request handlers

In your request handlers you'll have access to `request.pg.client` which you
can use to make DB requests. We even clean up the connection for you after the
request is complete.

During your request handler you can set `request.pg.kill` to `true`, and we'll
remove the connection from the pool instead of simply returning it to be
reused. This is usually done when an error is detected during a query.

```js
server.route({
    method: 'GET',
    path: '/',
    handler: function (req, reply) {

        const cmd = 'SELECT * FROM stats;';

        req.pg.client.query(cmd, (err, result) => {

            if (err) {
                request.pg.kill = true;

                return reply(err);
            }

            reply('Number of rows: ', result.rows.length);
        });
    }
});
```

### Outside of request handlers

Outside of request handlers you can get access to the Postgres `connect`
method. We expose it from the plugin already bound to the connection string.

After plugin registration is complete you'll have access through the
[`server.plugins` api](https://hapijs.com/api#serverplugins).

```js
const hpg = server.plugins['hapi-node-postgres'];

hpg.connect((err, client, done) => {

      if (err) {
          // handle error case
      }

      // make queries with client

      // call done to return client to the connection pool
  });
```


## Plugin registration

#### Register the plugin manually.

```js
const plugin = {
    register: require('hapi-node-postgres'),
    options: {
        connectionString: 'postgres://username:password@localhost/database',
        native: true
    }
};

server.register(plugin, (err) => {

    if (err) {
        console.error('Failed loading "hapi-node-postgres" plugin');
    }
 });
```

#### Or include it in your composer manifest.

```json
"plugins": {
    "hapi-node-postgres": {
        "connectionString": "postgres://username:password@localhost/database",
        "native": true
    }
}
```

The options passed to the plugin is an object where:

 - `connectionString` - a string representing the connection details for
    Postgres.
 - `attach` - a string representing the extension point event where the
    request is decorated with the `pg` attribute. Defaults to `onPreHandler`.
 - `detach` - a string representing the server event where the connection is
    cleaned up. Defaults to `tail`.
 - `native` - a boolean indicating if the native bindings should be used.
    Defaults to `false`. [Native bindings offer 20-30% increase in parsing
    speed.](https://github.com/brianc/node-postgres#native-bindings)

[See the hapijs docs to learn more about request lifecycle
events.](http://hapijs.com/api/#request-lifecycle)


## License

MIT


## Don't forget

What you create with `hapi-node-postgres` is more important than `hapi-node-postgres`.
