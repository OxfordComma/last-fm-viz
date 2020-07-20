var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async')
var LastfmAPI = require('lastfmapi')
var spotifyHelper = require('../dl/spotifyHelper.js')
var fetch = require('node-fetch')
// router.get('/spotify', async function(req, res, next) {
// 	if (req.session.passport && req.session.passport.user.spotify) {
// 		console.log('authed!')
// 		res.json(await spotifyHelper.getSpotifyRecentData(req))
	
// 	}
// 	else
// 	{
// 		req.session.return = '/data/spotify'
// 		res.redirect('/auth/spotify')
// 	}

// })

/* GET home page. */
// router.get('/music/tracks/:year', function(req, res, next) {
// 	const MongoClient = require('mongodb').MongoClient;
// 	const uri = "mongodb+srv://musicdb:musicdb@cluster0-cld3q.mongodb.net/test?retryWrites=true&w=majority";
// 	const client = new MongoClient(uri, { useNewUrlParser: true });
// 	client.connect(err => {
// 		if (err) throw err;
// 	  const collection = client.db("musicdb").collection("tracks");
//     collection.find({listen_date:{"$gt":new Date(req.params.year), "$lt":new Date(req.params.year+1)}}).toArray(function(err, docs) {
//     	if (err) throw err;
//     	// console.log(docs)
//       res.json(docs)
//   	  client.close();

// 	  });

// 	});
// });

// router.get('/music/artists/:year', function(req, res, next) {
// 	const MongoClient = require('mongodb').MongoClient;
// 	const uri = "mongodb+srv://musicdb:musicdb@cluster0-cld3q.mongodb.net/test?retryWrites=true&w=majority";
// 	const client = new MongoClient(uri, { useNewUrlParser: true });
// 	client.connect(err => {
// 		if (err) throw err;
// 	  const collection = client.db("musicdb").collection("artists");
//     collection.find({}).toArray(function(err, docs) {
//     	if (err) throw err;
//     	// console.log(docs)
//       res.json(docs)
//   	  client.close();

// 	  });

// 	});
// });

router.get('/music/lastfm/artists', async function(req, res, next) {
	if (!req.query.username)
		res.send('No username provided')

	var apiKey = process.env.lastfm_api_key
	var apiSecret = process.env.lastfm_api_secret
	var url = `https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${req.query.username}&api_key=${apiKey}&limit=200&page=1&format=json`
	
	console.log(url)
  var response = await fetch(url)
  var json = await response.json()
	res.json(json)
})



router.get('/music/lastfm/tracks', async function(req, res, next) {
	if (!req.query.username)
		res.send('No username provided')

	var apiKey = process.env.lastfm_api_key
	var apiSecret = process.env.lastfm_api_secret
	var numPages = 5
	var urls = []
	for (var i = 1; i <= numPages; i++)
		urls.push(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${req.query.username}&api_key=${apiKey}&limit=200&page=${i}&format=json`)
	
  var data = await Promise.all(urls.map(async url => {
  	var response = await fetch(url)
  	return await response.json()
	}))

	data = data.reduce((acc, curr) => acc.concat(curr.recenttracks.track), [])
	res.json(data)
})

module.exports = router;
