# hapi-node-postgres

Wrap requests with a pg connection.

We use the [`node-postgres`](https://github.com/brianc/node-postgres)
module and take advantage of it's connection pooling feature.

You'll have access to `request.pg.client` in your request handlers which you
can use to make db requests. We even clean up the connection for you after the
request.

During your request handler you can set `request.pg.kill` to `true` and we'll
remove the client from the pool so resources are reclaimed properly. This is
handy when an error occurs.


## Install

```bash
$ npm install hapi-node-postgres
```


## Usage

Register the plugin manually.

```js
var config = {
    connectionString: 'postgres://username:password@localhost/database'
};

server.pack.require('hapi-node-postgres', config, function (err) {

    if (err) {
        console.error(err);
        throw err;
    }
});
```

Or include it in your server manifest.

```js
...
plugins: {
    'hapi-node-postgres': {
        connectionString: 'postgres://username:password@localhost/database'
    }
},
...
```


## License

MIT


## Don't forget

What you make with `hapi-node-postgres` is more important than `hapi-node-postgres`.
