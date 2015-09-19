
var request = require('request');

var query = {
		apikey: 'NIht6DjAks1ZxOTkj2KWKRphIxhKxcGs',
		origin: 'BOS',
		destination: null,
		departure_date: '2015-10-06',
		duration: 7,
		direct: false,
		max_price: 500,
		aggregation_mode: 'DESTINATION'
};
var url = 'http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search' + queryString(query);

request.get(url, function (error, response, body){
	if (error) {
		console.log(error);
	}
	else {
		console.log(body);
	}
});

function queryString(query) {
	var str = '';
	for (var key in query) {
		if (query.hasOwnProperty(key) && query[key]) {
			if (!str) {
				str += '?' + key + '=' + query[key];
			}
			else {
				str += '&' + key + '=' + query[key];
			}
		}
	}
	return str;
}