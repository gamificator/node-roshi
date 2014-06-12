var roshi = require('./');

var client = roshi.createClient();

var now = Date.now(),
    i   = Math.floor(Math.random()*20);

console.time('insert');
client.insert("foo",now,"bar"+i, function(err, resp) {
	console.timeEnd('insert');
	console.log(resp);
	console.time('select');
	client.select("foo", function(err, resp) {
		console.timeEnd('select');
		console.log(resp);
		console.time('delete');
		client.delete("foo",now,"bar", function(err, resp) {
			console.timeEnd('delete');
			console.log(resp);
		});
	});
});