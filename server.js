var charmap = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

var express = require('express')
var app = express()

var mongodb = require('mongodb')
var mongoclient = mongodb.MongoClient
var mongourl = process.env.MONGOLAB_URI

app.use(express.static('public'))

app.get('/new/:url', function (req, res){
  var url = req.params.url
  var id = null
  mongoclient.connect(mongourl, function(err,db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
    } else {
      console.log('Connection established to', mongourl)
      var url_id_counter = db.collection('url_id_counter')
      url_id_counter.findAndModify(
        {
          query: {'_id': 'url_id'},
          update: { $inc: {'seq': 1} },
          new: true
        }
      ).then(function (ret){
        console.log(ret)
        var urls = db.collection('urls')
        urls.insertOne(
          {
            _id: ret.seq,
            url: url
          }, 
          function(err,data){
            if (err) throw err
            var shorturl = id2shorturl(ret.seq)
            res.send(shorturl)
          }
        )
        db.close
      })
      // console.log(ret)
      
    }
  })
})

app.get('/:shorturl', function(req,res){
  var shorturl = req.params.shorturl
  var id = shorturl2id(shorturl)
  console.log(id)
  res.send(id)
})

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('URL shortener app listening on port ' + port + '!')
})

function id2shorturl(id){
  var shorturl = ''
  
  while(id){
    shorturl += charmap[id%62]
    id = Math.floor(id / 62)
  }
  
  return shorturl.split('').reverse().join('')
}

function shorturl2id(url){
  var id = 0
  
  for(var i=0; i<url.length; i++){
    id = id*62 + charmap.indexOf(url[i])
  }
  
  return id
}