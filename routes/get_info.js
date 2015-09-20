var express = require('express');
var request = require('request');
var fs = require('fs');
var router = express.Router();

var key = '51QA3bKjAPpP4fvw75KxEIfMHSnxgcZW';
function queryString(query) {var str = ''; for (var key in query) {if (query.hasOwnProperty(key) && query[key]) {if (!str) {str += '?' + key + '=' + query[key]; } else {str += '&' + key + '=' + query[key]; } } } return str; }

/* GET home page. */
router.get('/', function(req, res, next) {
	var locationData = getCityCodeData(req.query.starting_location);
	console.log(locationData);
	if (locationData) {
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
				if (body.results) {
					for (var i = 0; i < body.results.length; i++) {
						//console.log(body.results[i]);
						var locationData = getCityCodeData(body.results[i].destination);
						body.results[i].locationData = locationData;
					}
					res.render('city', { results: body.results });
				}
				else {
					var error = new Error('Not Found');
					error.status = 404;
					res.render('error', { error: error, message: 'No results found' });
				}
			}
		});
	}
	else {
		var error = new Error('Not Found');
		error.status = 404;
		res.render('error', { error: error, message: 'No results found' });
	}
});

function getImage(str, callback) {
	var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURI(str);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
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
			var str = [codeMap[location].code, codeMap[location].name, codeMap[location].city_code, codeMap[location].city_name, codeMap[location].state, codeMap[location].country];
			var matchCount = 0;
			for (var j = 0; j < terms.length; j++) {
				for (var k = 0; k < str.length; k++) {
					if (str[k].toLowerCase().match(terms[j].toLowerCase())) {
						matchCount += 1;
					}
					if (str[k].toLowerCase() === terms[j].toLowerCase()) {
						matchCount += 1;
					}
				}
			}
			if (matchCount > bestMatchCount) {
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
			timezone: data.timezone,
			images: data.images
		};
	}
	return null;
}

module.exports = router;

