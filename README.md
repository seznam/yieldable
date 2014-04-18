# yieldable

[![Build Status](https://travis-ci.org/seznam/yieldable.svg?branch=master)](https://travis-ci.org/seznam/yieldable)

Make methods yieldable (via _y$_ name prefix). It's like [thunkify](https://github.com/visionmedia/node-thunkify), but for whole classes (prototypes) and objects (instances).

```js
// Turns this
obj.someAsyncMethod(arg1, arg2, arg3, function(err, result) {...});

// By doing this
yieldable(obj);

// Into this
var result = yield obj.y$someAsyncMethod(arg1, arg2, arg3);
// (notice a new method with y$ prefix, origin callback-style method remains unaffected)
```

## Installation

### node.js

```sh
npm install yieldable --save
```

## API
### `yieldable(src, [prefix])`
Make methods yieldable.
 * `src` (required): Class, Object or an Array of Classes/Objects.
 * `prefix` (optional): Custom name prefix for yieldable methods' variants. Default `y$`.

## Example
### yieldable class (prototype)
```js
var dbDriver = require('some-database-driver');
var co = require('co');
var yieldable = require('yieldable');

// Let's make dbDriver.Client's methods yieldable
yieldable(dbDriver.Client);

co(function*() {
    var db = new dbDriver.Client({host:'localhost', dbname:'myDatabase'});
    yield db.y$connect();
    var result = yield db.y$query('SELECT * FROM users WHERE username = ?', ['hajovsky']);
    console.log(result);
    yield db.y$disconnect();
})();
```

### yieldable object (instance)
```js
var dbDriver = require('some-database-driver');
var co = require('co');
var yieldable = require('yieldable');

co(function*() {
    // Create instance of dbDriver.Client and make it's methods yieldable
    var db = yieldable(new dbDriver.Client({host:'localhost', dbname:'myDatabase'}));
    yield db.y$connect();
    var result = yield db.y$query('SELECT * FROM users WHERE username = ?', ['hajovsky']);
    console.log(result);
    yield db.y$disconnect();
})();
```

### yieldable via custom prefix
```js
var dbDriver = require('some-database-driver');
var co = require('co');
var yieldable = require('yieldable');

yieldable(dbDriver.Client, 'yyy_');

co(function*() {
    var db = new dbDriver.Client({host:'localhost', dbname:'myDatabase'});
    yield db.yyy_connect();
    var result = yield db.yyy_query('SELECT * FROM users WHERE username = ?', ['hajovsky']);
    console.log(result);
    yield db.yyy_disconnect();
})();
```

### make yieldable multiple classes/objects
```js
var cql = require('node-cassandra-cql');
var MongoClient = require('mongodb').MongoClient;
var redis = require("redis");
var redisClient = redis.createClient();
var yieldable = require('yieldable');

yieldable([
    cql.Client,
    MongoClient,
    redisClient
]);
```



