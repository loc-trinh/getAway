var express = require('express');
var request = require('request');
var fs = require('fs');
var router = express.Router();

var key = '51QA3bKjAPpP4fvw75KxEIfMHSnxgcZW';
function queryString(query) {var str = ''; for (var key in query) {if (query.hasOwnProperty(key) && query[key]) {if (!str) {str += '?' + key + '=' + query[key]; } else {str += '&' + key + '=' + query[key]; } } } return str; }

/* GET home page. */
router.get('/', function(req, res, next) {
	var locationData = getCityCodeData(req.query.starting_location);
	var origin = locationData.code;
	var max_price = req.query.budget || 1000;
	query = {
			apikey: key,
			origin: origin,
			destination: null,
			departure_date: '2015-10-06--2015-11-06',
			duration: 7,
			direct: false,
			max_price: max_price,
			aggregation_mode: 'DESTINATION'
	};
	var url = 'http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search' + queryString(query);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
			var body = JSON.parse(body);
			var i = 0;
			next();
			function next() {
				if (i < body.results.length) {
					console.log(body.results[i]);
					var locationData = getCityCodeData(body.results[i].destination);
					body.results[i].locationData = locationData;
					getImage(locationData.city, function(images) {
						body.results[i].images = images;
						i++;
						next();
					});
				}
				else {
					res.json(body);
				}
			}
		}
	});
});

function getLocationData(str, callback) {
	var query = {
			apikey: key
	}
	var url = 'https://api.sandbox.amadeus.com/v1.2/location/' + str + queryString(query);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
			var data = JSON.parse(body).airports[0];
			callback(data);
		}
	});
}

function getImage(str, callback) {
	var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURI(str);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
			console.log(body);
			var results = JSON.parse(body).responseData.results;
		    var images = [];
		    for (var i = 0; i < results.length; i++) {
		    	images.push(results[i].unescapedUrl);
		    }
		    callback(images);
		}
	});
}

function getCityCodeData(str) {
	str = str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
	var terms = str.split(' ');	
	var codeMap = JSON.parse(fs.readFileSync('./cityCodes.json').toString());
	var data = null;
	var bestMatchCount = 0;
	for (var location in codeMap) {
		if (codeMap.hasOwnProperty(location)) {
			var str = codeMap[location].code + ' ' + codeMap[location].name + ' ' + codeMap[location].city_code + ' ' + codeMap[location].city_name + ' ' + codeMap[location].state + ' ' + codeMap[location].country;
			var matchCount = 0;
			for (var j = 0; j < terms.length; j++) {
				if (str.toLowerCase().match(terms[j].toLowerCase())) {
					matchCount += 1;
				}
			}
			if (matchCount > bestMatchCount) {
				//console.log(codeMap[location].city_name);
				data = codeMap[location];
				bestMatchCount = matchCount;
			}
		}
	}
	if (data) {
		return {
			code: data.city_code,
			city: data.city_name,
			state: data.state,
			country: data.country,
			timezone: data.timezone
		};
	}
	return null;
}

module.exports = router;

