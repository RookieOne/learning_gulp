// REQUIRE ALL THINGS!
var gulp = require('gulp')
var concat = require("gulp-concat")
var clean = require('gulp-clean')
var cssminify = require('gulp-minify-css')
var jsvalidate = require("gulp-jsvalidate")
var notify = require("gulp-notify")
var jasmine = require("gulp-jasmine")
var uglify = require("gulp-uglify")
var markdown = require("gulp-markdown")
var Handlebars = require("handlebars")
var tap = require("gulp-tap")
var rename = require("gulp-rename")

var Data = {
  title: "Gulp and Handlebars = Cool!"
}

gulp.task("partials", [], function() {
  return gulp.src("contents/partials/**.hbs")
      .pipe(tap(function(file) {
        var name = file.relative.replace(".hbs", "")
        var template = file.contents.toString()
        Handlebars.registerPartial(name, template)
      }))
})

gulp.task("read-pages", ["clean"], function() {
  Data.pages = []
  return gulp.src("contents/pages/**.md")
      .pipe(tap(function(file) {
        var contents = file.contents.toString()
        var index = contents.indexOf("---")
        if (index === -1) {
          return
        }
        var data = JSON.parse(contents.slice(0, index))
        data.url = "/pages/" + file.relative.replace(".md", ".html")
        console.log(data)
        Data.pages.push(data)
        contents = contents.slice(index+3, contents.length)
        file.contents = new Buffer(contents, "utf-8")
      }))
      .pipe(markdown())
      .pipe(gulp.dest("tmp/pages"))
})

gulp.task("pages", ["clean", "read-pages", "partials"], function() {
  return gulp.src("contents/page.hbs")
        .pipe(tap(function(file) {
          var template = Handlebars.compile(file.contents.toString())
          gulp.src("tmp/pages/**.html")
            .pipe(tap(function(file) {
              var html = template({
                contents: file.contents.toString()
              })
              file.contents = new Buffer(html, "utf-8")
            }))
            .pipe(gulp.dest("build/pages"))
        }))
})

gulp.task("watch", function() {
  return gulp.watch(["contents/**/**.*"], ["default"])
})

gulp.task("homepage", ["clean", "read-pages", "partials"], function() {
  return gulp.src("contents/index.hbs")
          .pipe(tap(function(file) {
            var template = Handlebars.compile(file.contents.toString())
            var html = template(Data)
            file.contents = new Buffer(html, "utf-8")
          }))
          .pipe(rename(function(path) {
            path.extname = ".html"
          }))
          .pipe(gulp.dest("build"))
})

gulp.task("test", function() {
  return gulp.src("contents/specs/**.js")
          .pipe(jasmine())
})

gulp.task("javascripts", ["clean"], function() {
  return gulp.src("contents/javascripts/**.js")
          .pipe(jsvalidate())
          .on("error", notify.onError(function(error) {
            console.log("OMG a JS ERROR!")
            console.log(error.message)
            console.log(error.fileName)
            return error.message
          }))
          .pipe(uglify())
          .pipe(gulp.dest("build/javascripts"))
})

gulp.task("clean", function() {
  return gulp.src(["build/**/**.*", "tmp/**/*.*"])
          .pipe(clean())
})

gulp.task("css", ["clean"], function() {
  return gulp.src("contents/styles/**.css")
          .pipe(concat("main.min.css"))
          .pipe(cssminify())
          .pipe(gulp.dest("build/styles"))
})

gulp.task("default", ["clean", "css", "javascripts", "homepage", "pages"])








