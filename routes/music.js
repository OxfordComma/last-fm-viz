var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async')


router.get('/tree', function(req, res, next) {
	res.render('tree')
});

router.get('/:year', function(req, res, next) {
	res.render('music', { listenYear: req.params.year })
});



module.exports = router;


