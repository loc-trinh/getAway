
var request = require('request');
var fs = require('fs');

getLocations('Boston');

function getLocations(originStr) {
	var origin = iataCityCode(originStr);
	var query = {
			apikey: 'NIht6DjAks1ZxOTkj2KWKRphIxhKxcGs',
			origin: origin,
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
}

function iataCityCode(str) {
	str = str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
	var terms = str.split(' ');	
	var temp = fs.readFileSync('./IATACityCodes.txt').toString().split('\n');
	var locations = [];
	for (var i = 0; i < temp.length; i++) {
		if (temp) {
			locations.push(temp[i].replace(/^(\s*)|(\s*)$/g, '').replace(/\s+/g, ' '));
		}
	}
	var code = null;
	var bestMatchCount = 0;
	for (var i = 0; i < locations.length; i++) {
		var matchCount = 0;
		for (var j = 0; j < terms.length; j++) {
			if (locations[i].toLowerCase().match(terms[j].toLowerCase())) {
				matchCount += 1;
			}
		}
		if (matchCount > bestMatchCount) {
			console.log(locations[i]);
			code = locations[i].slice(locations[i].length - 3);
			bestMatchCount = matchCount;
		}
	}
	console.log(code);
	return code;
}

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