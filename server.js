/* Book Marker Warm Up (18.3.1)
 * backend
 * ==================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");

// Initialize Express
var app = express();

// Configure our app for morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Static file support with public folder
app.use(express.static("public"));

// Mongojs configuration
var databaseUrl = "NYTScraper";
var collections = ["articles"];

// Hook our mongojs config to the db var
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Routes
// ======

app.get("/scrape", function(req, res){
  request("https://www.nytimes.com/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each article tag within it find a tag
    // (i: iterator. element: the current element)
    $("article a").each(function(i, element) {

      // Save the text of the element in a "title" variable
      var title = $(element).text();

      // In the currently selected element, save the values for any "href" attributes that the child elements may have
      var link = $(element).attr("href");

      // Save these results in an object that we'll push into the results array
      results.push({
        title: title,
        link: link
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    res.json(results);
  });
})


// Post an article to the mongoose database
app.post("/submit", function(req, res) {

  // Save the request body as an object called article
  var article = req.body;


  // Save the article object as an entry into the articles collection in mongo
  db.articles.save(article, function(error, saved) {
    // Show any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the response to the client (for AJAX success function)
    else {
      res.send(saved);
    }
  });
});

// Find all articles
app.get("/saved", function(req, res) {
  // Go into the mongo collection, and find all docs where "read" is false
  db.articles.find(function(error, found) {
    // Show any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the articles we found to the browser as a json
    else {
      res.json(found);
    }
  });
});


app.delete("/delete/:id", function(req, res) {
  db.articles.remove({ "_id": mongojs.ObjectId(req.params.id) }, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
