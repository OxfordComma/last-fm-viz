var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async')

// router.get('/', 
// 	passport.authenticate('spotify'), 
// 	function(req, res, next) {
// 		res.render('music')
// })



router.get('/musicstream', function(req, res, next) {
	res.render('music', { 
		username: req.query.username, 
		pages: req.query.pages 
	})
})

router.get('/username', function(req, res, next) {
	res.render('username')
})

router.get('/last12months', function(req, res, next) {
	res.render('last12months', { username: 'Philosiphicus' })
});

router.get('/tree', function(req, res, next) {
	res.render('tree')
});

router.get('/:year', function(req, res, next) {
	res.render('music', { listenYear: req.params.year })
});




module.exports = router;


