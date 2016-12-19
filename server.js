var express = require('express')
var app = express()

app.use(express.static('public'))

app.get('/new/:url', function (req, res){
  res.send(req.params.url)
})

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('URL shortener app listening on port ' + port + '!')
})