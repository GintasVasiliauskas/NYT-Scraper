// Click Events

$("#scrape").on("click", function(){
  scrape()
})

function scrape() {
  $.ajax({
    type: "GET",
    url: "/scrape"
  })
  .done(function(data){
    for (var i = 0; i < data.length && i<50; i++) {
      if (data[i].title.length>5) {
      $("#unread").append("<tr><td><a href='"+data[i].link+"'>" + data[i].title + "</a></td><td><button class='save'"+
        " articleTitle='" + data[i].title + "' articleLink='"+ data[i].link +"'>Save for later"+
        "</button></td></tr>");
      }
    }
  })
}

// Click event to save an article to the db\
$(document).on("click", ".save", function() {
  console.log("saving")
  $.ajax({
    type: "POST",
    url: "/submit",
    dataType: "json",
    data: {
      title: $(this).attr("articleTitle"),
      link: $(this).attr("articleLink")
    }
  })
  .done(function(data) {
    getSaved();
    scrape();
    }
  );
  return false;
});

// Load saved articles and render them to the screen
function getSaved() {
  $("#unread").empty();
  $.getJSON("/saved", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#unread").prepend("<tr><td><a href='"+data[i].link+"'>" + data[i].title + "</a></td><td><button class='delete'"+
        " articleTitle='" + data[i].title + "' articleLink='"+ data[i].link +
        "' data-id = '" + data[i]._id + "'>Delete"+
        "</button></td></tr>");
    }
    $("#unread").prepend("<tr><th>Title</th><th>Status</th></tr>");
  });
}



// Click event to mark a book as read
$(document).on("click", ".delete", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "DELETE",
    url: "/delete/"+ thisId,
    dataType: "json",
    data: {
      title: $(this).attr("articleTitle"),
      link: $(this).attr("articleLink"),
      id: $(this).attr("data-id")
    }
  })
  .done(function(data){
    console.log(data)
  })
  $(this).parents("tr").remove();
  getSaved();
  scrape();
});

// // Calling our functions
getSaved();

