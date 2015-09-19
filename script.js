
var request = require('request');
var fs = require('fs');

var key = '51QA3bKjAPpP4fvw75KxEIfMHSnxgcZW';
function queryString(query) {var str = ''; for (var key in query) {if (query.hasOwnProperty(key) && query[key]) {if (!str) {str += '?' + key + '=' + query[key]; } else {str += '&' + key + '=' + query[key]; } } } return str; }

//console.log(getCityCodeData('New York'));

var codeMap = JSON.parse(fs.readFileSync('./cityCodes.json').toString());
var temp = [];
for (var code in codeMap) {
	if (codeMap.hasOwnProperty(code)) {
		temp.push(code);
	}
}

var i = 0;
next();
function next() {
	if (i < temp.length) {
		if (!codeMap[temp[i]].images) {
			console.log(i);
			getImage(codeMap[temp[i]].city_name, function(images) {
				codeMap[temp[i]].images = images;
				//console.log();
				//console.log();
				//console.log(JSON.stringify(codeMap));
				fs.writeFileSync('./cityCodes.json', JSON.stringify(codeMap));
				console.log(i + 1 + ' / ' + temp.length);
				i++;
				next();
			});
		}
		else {
			i++;
			next();
		}
	}
	else {
		console.log('done');
	}
}

/*getImage('cat', function(images) {
	console.log(images);
});*/

/*var temp = fs.readFileSync('./IATACityCodes.txt').toString().split('\n');
var locations = [];
for (var i = 0; i < temp.length; i++) {
	if (temp) {
		locations.push(temp[i].replace(/^(\s*)|(\s*)$/g, '').replace(/\s+/g, ' '));
	}
}
var codeMap = {};
var i = 0;
next();
function next() {
	if (i < locations.length) {
		console.log(i + 1 + ' / ' + locations.length);
		var code = locations[i].slice(locations[i].length - 3);
		getLocationData(code, function(data) {
			if (data) {
				console.log(code);
				console.log(data);
				codeMap[code] = data;
				console.log(JSON.stringify(codeMap));
			}
			i++;
			next();
		});
	}
	else {
		
	}
}*/

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

/*var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var codeMap = {};

var i = 0;
next();
function next() {
	if (i < alphabet.length) {
		var letter = alphabet[i];
		console.log(letter);
		getLocationData(letter, function(data) {
			if (data) {
				for (var j = 0; j < data.length; j++) {
					codeMap[data[j].value] = data[j].label;
				}
			}
			console.log(JSON.stringify(codeMap));
			i++;
			next();
		});
	}
	else {
		
	}
}*/

/*var i = 0;
next1();
function next1() {
	if (i < alphabet.length) {
		var j = 0;
		next2();
		function next2() {
			if (j < alphabet.length) {
				var k = 0;
				next3();
				function next3() {
					if (k < alphabet.length) {
						var code = alphabet[i] + alphabet[j] + alphabet[k];
						getLocationData(code, function(data) {
							if (data) {
								codeMap[code] = data;
								console.log(JSON.stringify(codeMap));
								console.log(code + ' - ' + data.city_name);
							}
							k++;
							next3();
						});
					}
					else {
						j++;
						next2();
					}
				}
			}
			else {
				i++;
				next1();
			}
		}
	}
	else {
		console.log(JSON.stringify(codeMap));
	}
}*/

/*for (var i = 0; i < alphabet.length; i++) {
	for (var j = 0; j < alphabet.length; j++) {
		for (var k = 0; k < alphabet.length; k++) {
			var code = alphabet[i] + alphabet[j] + alphabet[k];
			console.log(code);
			getLocationData(code, function(data) {
				if (data) {
					console.log(code + ' - ' + data.city_name);
					codeMap[code] = data;
					console.log(JSON.stringify(codeMap));
				}
			});
		}
	}
}*/

function getImage(str, callback) {
	var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&q=' + encodeURI(str);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
			try {
				var results = JSON.parse(body).responseData.results;
			    var images = [];
			    for (var i = 0; i < results.length; i++) {
			    	images.push(results[i].unescapedUrl);
			    }
			    callback(images);
			} catch(e) {
				console.log(body);
				throw e;
			}
		}
	});
}

function getLocationData(str, callback) {
	var query = {
			apikey: key
	}
	var url = 'https://api.sandbox.amadeus.com/v1.2/location/' + str+ queryString(query);
	request.get(url, function (error, response, body){
		if (error) {
			console.log(error);
		}
		else {
			var data = JSON.parse(body).airports;
			if (data) {
				callback(data[0]);
			}
			else {
				callback(undefined);
			}
		}
	});
}