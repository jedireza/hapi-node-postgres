# hapi-node-postgres

Wrap requests with a Postgres connection.

We use the [`pg`](https://github.com/brianc/node-postgres) (`node-postgres`)
module and take advantage of it's connection pooling feature.

Note: Your project should have it's own `pg` and `pg-native` dependencies
installed.  We depend on `pg` and `pg-native` via `peerDependencies`.


## Install

```bash
$ npm install hapi-node-postgres
```


## Usage

In your request handlers you'll have access to `request.pg.client` which you
can use to make db requests. We even clean up the connection for you after the
request.

During your request handler you can set `request.pg.kill` to `true` and we'll
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
         console.log('Failed loading plugin');
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
