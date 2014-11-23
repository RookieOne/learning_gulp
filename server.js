var connect = require("connect")
var serveStatic = require("serve-static")

var app = connect()

var logger = function(req, res, next) {
  console.log("%s %s", req.method, req.url)
  next()
}

app.use(logger)
app.use(serveStatic(__dirname + "/build"))
app.listen(3000)