var http    = require('http');

function RoshiClient (port, host) {
	this.port     = port || 6302;
	this.host     = host || "127.0.0.1";
	this.limit    = 10;
	this.offset   = 0;
	this.coalesce = false;
}

RoshiClient.prototype.request = function(method, data, callback, qs) {
	var path = "/",
	    lastError;

	if (method.toUpperCase() === "GET") {
		path += this.qs(qs);
	}

	var req = http.request({
		hostname: this.host,
		port:     this.port,
		method:   method,
		path:     path
	}, this.bodyParser(callback));
	this.send(req, data);
	req.on("error", function(err) {
		lastError = err;
	});
};

RoshiClient.prototype.insert = function(key, timestamp, value, callback) {
	callback = callback || function(){};
	this.request("POST", [{
		"key":    this.toBase64(key),
		"score":  timestamp,
		"member": this.toBase64(value)
	}], callback);
};

RoshiClient.prototype.delete = function(key, timestamp, value, callback) {
	callback = callback || function(){};
	this.request("DELETE", [{
		"key":    this.toBase64(key),
		"score":  timestamp,
		"member": this.toBase64(value)
	}], callback);
};

RoshiClient.prototype.select = function(key, offset, limit, callback) {
	if (typeof offset === 'function') {
		callback = offset;
		offset   = null;
		limit    = null;
	} else
	if (typeof limit === 'function') {
		callback = limit;
		offset   = null;
		limit    = null;
	}
	callback = callback || function(){};
	this.request("GET", [this.toBase64(key)], function(err, json) {
		if (json.error != null) return callback(this.wrapError(json));
		return callback(err, this.parseRecords(json.records[key]));
	}, {
		offset:   offset || this.offset,
		limit:    limit  || this.limit,
		coalesce: this.coalesce
	});
};

RoshiClient.prototype.wrapError = function(json) {
	var code      = json.code,
	    message   = json.description,
	    error     = new Error;
	error.code    = code;
	error.message = message;
	return error;
};

RoshiClient.prototype.serialize = function(object) {
	return JSON.stringify(object);
};

RoshiClient.prototype.parseRecords = function(records) {
	return records.map(function(record) {
		return this.fromBase64(record.member);
	}, this);
};

RoshiClient.prototype.parseRecord = function(record) {
	return {
		"key":    this.fromBase64(record.key),
		"score":  record.score,
		"member": this.fromBase64(record.member)
	};
};

RoshiClient.prototype.send = function(req, object) {
	var payload = this.serialize(object);
	req.setHeader("Content-Length", payload.length);
	req.write(payload);
	req.end();
};

RoshiClient.prototype.bodyParser = function(callback, ctx) {
	ctx = ctx || this;
	return function(resp) {
		var chunks = [],
		    size   = 0;
		resp.on("data", function(chunk) {
			size += chunk.length;
			chunks[chunks.length] = chunk;
		});
		resp.on("end", function() {
			var raw  = Buffer.concat(chunks, size),
			    body = JSON.parse(raw);
			return callback.call(ctx, null, body);
		});
	}
};

RoshiClient.prototype.qs = function(data) {
	if (data == null) return "";
	var qs = "?";
	qs += Object.keys(data)
	.map(function(key) {
		var value = data[key];
		return key+"="+value;
	}, this)
	.join("&");
	return qs;
};

RoshiClient.prototype.toBase64 = function(str) {
	return (new Buffer(""+str)).toString("base64");
};

RoshiClient.prototype.fromBase64 = function(str) {
	return (new Buffer(""+str, "base64")).toString("utf8");
};

RoshiClient.prototype.Insert = RoshiClient.prototype.insert;
RoshiClient.prototype.Delete = RoshiClient.prototype.delete;
RoshiClient.prototype.Select = RoshiClient.prototype.select;
RoshiClient.prototype.INSERT = RoshiClient.prototype.insert;
RoshiClient.prototype.DELETE = RoshiClient.prototype.delete;
RoshiClient.prototype.SELECT = RoshiClient.prototype.select;

RoshiClient.createClient = function(port, host) {
	return new RoshiClient(port, host);
};

module.exports = RoshiClient;