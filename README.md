node-roshi
==========

[roshi](https://github.com/soundcloud/roshi) client for node.js

istalling
---------

```bash
  npm install roshi
```  

api
---

* insert(key, timestamp, value, [callback])
* delete(key, timestamp, value, [callback])
* select(key, [offset], [limit], callback) []TimestampValue

usage
-----

first of all you need to build, and start [roshi-server](https://github.com/soundcloud/roshi/tree/master/roshi-server)

```javascript
  var roshi = require('roshi');
  
  var port = 6302;
  var host = "127.0.0.1";
  
  // you can pass port and host variables directly to fabric,
  var client = roshi.createClient(port, host);
  
  // or set directly to client instance
  client.port = port;
  client.host = host;
  // btw, that host/port pair are default one
  
  var now = Date.now();
  
  client.insert("myKey", now, "myValue", function(err){
    // ...
  });
  
  
  // 2nd, and 3rd argument of #select may be offset, and limit values,
  // which you can set as default:
  client.offset = 0;
  client.limit  = 1;
  client.select("myKey", function(err, values){
    // values = ["myValue"]
  });
  
  client.delete("myKey", now, "myValue", function(err){
    // ...
  });
  
```

licence
-------

See [LICENSE](https://github.com/gamificator/node-roshi/blob/master/LICENSE)
