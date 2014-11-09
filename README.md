#connect-parse

This is a simple session store for connect using [Parse](https://parse.com/products/core 'Parse Code').

It uses the [parse npm module](https://www.npmjs.org/package/parse), which you are probably using already as a data storage for your project.

## Installation
	$ npm install connect-parse
	  

## Options
A Parse client is required.  An existing client can be passed directly using the `client` option or created for you using `parseAppId` and `parseJavascriptKey` options.
  - `client` An existing, initialised Parse client created using [parse npm module](https://www.npmjs.org/package/parse);
  - `parseAppId`, `parseJavascriptKey` your Parse Application ID and JavaScript key. Could be omitted if initialised Parse client is passed via `client` option;

The following additional params may be included:

  - `ttl` Session TTL (Time to live) expiration in seconds. Defaults to `cookie.maxAge` if set, or to `86400` seconds (1 day);
  - `parseClassName` Class name to store sessions in Parse. Defaults to `Session`.


## Usage
We pass `express-session` to required `connect-parse` module exports in order to extend default connect `session.Store`:
````javascript
var session = require('express-session');
var ParseStore = require('connect-parse')(session);

var Parse = require('parse').Parse;
Parse.initialize('PARSE_APPLICATION_ID', 'PARSE_JAVASCRIPT_KEY');

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new ParseStore({
    client: Parse
  }),
  resave: true,
  saveUninitialized: true
}));
````