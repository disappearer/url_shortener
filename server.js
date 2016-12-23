var charmap = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

var express = require('express')
var app = express()

var mongourl = process.env.MONGOLAB_URI
var mongoose = require('mongoose')
var counter_schema = new mongoose.Schema({_id: String, seq: Number})
var url_schema = new mongoose.Schema({_id: Number, url: String})

app.use(express.static('public'))

app.get(/^\/new\/([\s\S]*)/, function (req, res){
  var url = req.params[0]
  var validUrl = require('valid-url')
  if(!validUrl.isWebUri(url)){
    var retstring = '\'' + url + '\'is not a valid web url. Please try again.'
    res.send(retstring)
    return
  }
  var id = null
  var connection = mongoose.createConnection(mongourl)
  var Counter = connection.model('Counter', counter_schema, 'url_id_counter')
  var Url = connection.model('Url', url_schema, 'urls')
  Counter.findOneAndUpdate(
    {_id: 'url_id'},
    {$inc: {seq: 1}},
    function(err, counter){
      if(err) throw err
      id = counter.seq
      Url.create({_id: id, url: url}, function(err, new_url){
        if(err) throw err
        var shorturl = 'https://lexlabs-shorturl.herokuapp.com/' + id2shorturl(id)
        var retObj = {
          original_url: url,
          short_url: shorturl
        }
        res.send(retObj)
        connection.close()
      })
    })
    
})

app.get('/:shorturl', function(req,res){
  var shorturl = req.params.shorturl
  var id = shorturl2id(shorturl)
  var connection = mongoose.createConnection(mongourl)
  var Url = connection.model('Url', url_schema, 'urls')
  Url.findOne(
    {_id: id},
    function(err, url){
      if(err) throw err
      if(!url){
        res.send('Not found.')
      }
      else {
        res.redirect(url.url)
      }
      connection.close()
    }
  )
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