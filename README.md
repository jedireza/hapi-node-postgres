# hapi-node-postgres

Wrap requests with a Postgres connection.

[![Dependency Status](https://david-dm.org/jedireza/hapi-node-postgres.svg)](https://david-dm.org/jedireza/hapi-node-postgres)
[![devDependency Status](https://david-dm.org/jedireza/hapi-node-postgres/dev-status.svg?theme=shields.io)](https://david-dm.org/jedireza/hapi-node-postgres#info=devDependencies)
[![Build Status](https://travis-ci.org/jedireza/hapi-node-postgres.svg?branch=master)](https://travis-ci.org/jedireza/hapi-node-postgres)

We use the [`pg`](https://github.com/brianc/node-postgres) (`node-postgres`)
module and take advantage of its connection pooling feature.

Note: Your project should have its own `pg` and `pg-native` dependencies
installed.  We depend on `pg` and `pg-native` via `peerDependencies`.


## Install

```bash
$ npm install hapi-node-postgres
```


## Usage

In your request handlers you'll have access to `request.pg.client` which you
can use to make DB requests. We even clean up the connection for you after the
request.

During your request handler you can set `request.pg.kill` to `true`, and we'll
remove the client from the pool so resources are reclaimed properly. This is
usually done when an error occurs.


#### Register the plugin manually.

```js
var plugin = {
    register: require('hapi-node-postgres'),
    options: {
        connectionString: 'postgres://username:password@localhost/database'
    }
};

server.register(plugin, function (err) {

    if (err) {
        console.error('Failed loading "hapi-node-postgres" plugin');
    }
 });
```

#### Or include it in your composer manifest.

```json
"plugins": {
    "hapi-node-postgres": {
        "connectionString": "postgres://username:password@localhost/database"
    }
}
```


## License

MIT


## Don't forget

What you create with `hapi-node-postgres` is more important than `hapi-node-postgres`.
