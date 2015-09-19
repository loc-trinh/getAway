var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var today = new Date();
	dateString = (today.getMonth()+1).toString() + "/" + today.getDate().toString()+"/"+today.getFullYear().toString();
	res.render('index', { title: 'getAway' , date:dateString});
});

module.exports = router;
