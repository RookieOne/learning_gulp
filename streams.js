var fs = require("fs")

var stream = fs.createReadStream(__dirname + "/contents/stys/other_styles.css")

stream.on("data", function(chunk) {
  console.log(chunk.toString())
})

stream.on("end", function() {
  console.log("END")
})

stream.on("error", function(error) {
  console.log("OH NO! An error!")
  console.log(error)
})