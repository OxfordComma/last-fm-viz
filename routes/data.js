var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async')
var LastfmAPI = require('lastfmapi')


/* GET home page. */
router.get('/music/tracks/:year', function(req, res, next) {
	const MongoClient = require('mongodb').MongoClient;
	const uri = "mongodb+srv://musicdb:musicdb@cluster0-cld3q.mongodb.net/test?retryWrites=true&w=majority";
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		if (err) throw err;
	  const collection = client.db("musicdb").collection("tracks");
    collection.find({listen_date:{"$gt":new Date(req.params.year), "$lt":new Date(req.params.year+1)}}).toArray(function(err, docs) {
    	if (err) throw err;
    	// console.log(docs)
      res.json(docs)
  	  client.close();

	  });

	});
});

router.get('/music/artists/:year', function(req, res, next) {
	const MongoClient = require('mongodb').MongoClient;
	const uri = "mongodb+srv://musicdb:musicdb@cluster0-cld3q.mongodb.net/test?retryWrites=true&w=majority";
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		if (err) throw err;
	  const collection = client.db("musicdb").collection("artists");
    collection.find({}).toArray(function(err, docs) {
    	if (err) throw err;
    	// console.log(docs)
      res.json(docs)
  	  client.close();

	  });

	});
});

router.get('/music/lastfm/artists', function(req, res, next) {
	var lfm = new LastfmAPI({
		'api_key' : 'a66e2f168fdbcda137799a2c165678ee',
		'secret' : '0472282104fce606c4d59bd659a66397'
	});
	lfm.user.getTopArtists({
		'user' : 'Philosiphicus',
		'period' : '12month'
		// 'limit': 1000
	}, function (err, topArtists) {
		if (err) { throw err; }
		console.log(topArtists.artist[0]);
		res.json(topArtists)
	});
})

module.exports = router;
