var myApp = {};


// Max results to display in dropdowns
// after saerch
myApp.maxResults = 10;

// Goodreads & movieDB return containers
myApp.goodReadsResult = {};
myApp.movieDBResult = {};
myApp.movieRating;

// ********************************
// Set listeners for search buttons
myApp.setSearchListener = function() {

	// Listener for the 1st submit
	// After the user provides input for book/movie name
	$('#search-form').on('submit', function(event) {
        $('#searchQuery').blur();
		event.preventDefault();

		$('#error-text').empty();
		console.log('* Calling startNewGet()');
		var searchTerm = $('input[type=text]').val(); 
		myApp.startNewGet(searchTerm);
	
	  });

	var newButton = document.getElementById('searchId');
	console.log(newButton)

	$(newButton).on('click', function(event) {
		console.log('clicking')
		// event.preventDefault();
		$('#search-form').submit();
		});

	// Listener for the 2nd submit
	// after user has selected from dropdown options
	$('#compare-form').on('submit', function(event) {
		event.preventDefault();
		console.log('**** Calling comparison');

		// Show comparison box
		$('.comparisonSection').addClass('fadeInTwo');

		// Find dropdown windows in the window
		var dropDownWindowBooks = document.getElementById('bookDropdown');
		var dropDownWindowMovies = document.getElementById('movieDropdown');  

		// Get values from selected inputs
		var bookResults = dropDownWindowBooks.options[dropDownWindowBooks.selectedIndex].value;
		var movieResults = dropDownWindowMovies.options[dropDownWindowMovies.selectedIndex].value;

		// Update results using selected book/movie combination
		myApp.updateResultBoxes(bookResults, movieResults);
	});
}



// Query Goodreads API
// https://www.goodreads.com/api
myApp.queryGoodReads = function(title) {
	console.log('**a Calling goodreads with title query');

	// Query goodreads DB with title
	myApp.goodReadsResult = $.ajax({
	    url: 'http://proxy.hackeryou.com',
	    dataType: 'json',
	    method: 'GET',
	    data: {
	        reqUrl: 'https://www.goodreads.com/search/index.xml',
	        params: {
	            key: 'Z0LkLtwTlY22YUx62zkig',
	            q: title
	        },
	        xmlToJSON: true
	    }
	});
}

// Movie DB API
// http://docs.themoviedb.apiary.io/#reference/search/searchmovie/get
myApp.queryMovieDB = function(title) {
	console.log('**b Calling movie DB with title query');

	// Query movie DB with title
	myApp.movieDBResult = $.ajax({
	    url: 'http://proxy.hackeryou.com',
	    dataType: 'json',
	    method: 'GET',
	    data: {
	        reqUrl: 'https://api.themoviedb.org/3/search/movie',
	        params: {
	            api_key: 'cf148fdb8b696497355c8b9c740f6954',
	            query: title
	        },
	        xmlToJSON: false
	    }
	});
	// .then(function(moviedbResponse) {console.log(moviedbResponse)});
}

// Wait for MovieDB & Goodreads APIs to return objects
myApp.waitForRatings = function() {
	$.when(myApp.goodReadsResult, myApp.movieDBResult).then(function(data, moviedbResponse) {

		console.log('*** bookDB object returned: ', data[0]);
		console.log('*** movieDB object returned: ', moviedbResponse[0]);


		myApp.goodReadsResult = data;
		myApp.movieDBResult = moviedbResponse;

		myApp.showSearchResults(data[0], moviedbResponse[0]);

	});
}

// Append results of search to dropdowns
// After user submits a search query
myApp.showSearchResults = function(data1, data2) {
	if (data1.GoodreadsResponse.search['total-results'] == "0" && data2.results.length == 0) {
		$('#error-text').text('Cannot find a book or movie with this title.');
	}
	else if (data1.GoodreadsResponse.search['total-results'] == "0") {
		$('#error-text').text('Cannot find a book with this title.');
	} else if (data2.results.length == 0) {
		$('#error-text').text('Cannot find a movie with this title.');
	} else {

		// Find books dropdown
		var bookContainer = $('.booksResults');

		// Find movies dropdown
		var moviesContainer = $('.moviesResults');

		// Cleam books & movies dropdowns
		bookContainer.empty();
		moviesContainer.empty();
		
		// Add search results to books dropdown
		for (i = 0; i < data1.GoodreadsResponse.search.results.work.length && i < myApp.maxResults; ++i) {
			// Make a new option to add to dropdown
			var opt = $('<option>');

			// Set the option value to its position in the array
			opt.val(i);

			// Set the text of the option to the current book result
		    opt.html(data1.GoodreadsResponse.search.results.work[i].best_book.title + " - " + data1.GoodreadsResponse.search.results.work[i].original_publication_year.$t); 

		    // Add this option to the books dropdown
		    bookContainer.append(opt);
		}

		// populate list 2
		for (i = 0; i < data2.results.length && i < myApp.maxResults; ++i) {
			// Make a new option to add to dropdown
			var opt = $('<option>');

			// Set the option value to its position in the array
			opt.val(i);

			// Set the text of the option to the current movie result
			// and add the year of release at the end
		    opt.html(data2.results[i].original_title + " - " + data2.results[i].release_date.substring(0,4));

		    // Add this option to the movies dropdown
		    moviesContainer.append(opt); 
		}

		// Make search results cotainers visible
		$('.firstResults').addClass('fadeIn');
		$('.firstResults').addClass('animated');
	}
}

// Start a new movie/book comparison query
myApp.startNewGet = function(title) {

	// Query Goodreads
	myApp.queryGoodReads(title);

	// Query movie DB
	myApp.queryMovieDB(title);

	// Start wait for ratings
	myApp.waitForRatings(title);
}

// Set contents of results boxes to new content
myApp.updateResultBoxes = function(whichBook, whichMovie) {

	// Get URL of book cover image from goodreads result
	var bookImageUrl = myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].best_book.image_url;
	
	// Get large image instead of medium/small size
	var shortUrl = bookImageUrl.substr(bookImageUrl.length - 20);
	var shortUrlLarge = shortUrl.replace(/m/, "l");
	bookImageUrl = bookImageUrl.substr(0, bookImageUrl.length - 20).concat(shortUrlLarge);

	// Set book image, title, year & stars
	$('#bookImage').css('background-image', 'url(' + bookImageUrl + ')');
	$('.bookResult h2').html(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].best_book.title);
	$('.bookResult p').text(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].average_rating + " / 5");
	$("#rateYoBook").rateYo({
	  rating: myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].average_rating,
	  readOnly: true
	});

	var bookRating = myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].average_rating;
	console.log(bookRating);

	var movieImageUrl = 'http://image.tmdb.org/t/p/w300' + myApp.movieDBResult[0].results[whichMovie].poster_path;

	// Set movie image, title, year & stars
	$('#movieImage').css('background-image', 'url(' + movieImageUrl + ')');
	$('.movieResult h2').text(myApp.movieDBResult[0].results[whichMovie].title);
	$('.movieResult p').text(myApp.movieDBResult[0].results[whichMovie].vote_average / 2 + " / 5");
	$("#rateYoMovie").rateYo({
	  rating: myApp.movieDBResult[0].results[whichMovie].vote_average / 2,
	  readOnly: true
	});

	var movieRating = myApp.movieDBResult[0].results[whichMovie].vote_average / 2;
	console.log(movieRating);

	// Makes winner bigger and loser smaller

	if (bookRating > movieRating) {
			$('.bookResult').addClass('winner');
			$('.movieResult').addClass('loser');
		} else { 
			$('.movieResult').addClass('winner');
			$('.bookResult').addClass('loser');
	   } 
};

//Flipping cards on main page

(function() {

  // cache vars
  var cards = document.querySelectorAll(".card.effect__random");
  var timeMin = 1;
  var timeMax = 3;
  var timeouts = [];

  // loop through cards
  for ( var i = 0, len = cards.length; i < len; i++ ) {
    var card = cards[i];
    var cardID = card.getAttribute("data-id");
    var id = "timeoutID" + cardID;
    var time = randomNum( timeMin, timeMax ) * 1000;
    cardsTimeout( id, time, card );
  }

  // timeout listener
  function cardsTimeout( id, time, card ) {
    if (id in timeouts) {
      clearTimeout(timeouts[id]);
    }
    timeouts[id] = setTimeout( function() {
      var c = card.classList;
      var newTime = randomNum( timeMin, timeMax ) * 1000;
      c.contains("flipped") === true ? c.remove("flipped") : c.add("flipped");
      cardsTimeout( id, newTime, card );
    }, time );
  }

  // random number generator given min and max
  function randomNum( min, max ) {
    return Math.random() * (max - min) + min;
  }

})();


// ****
// INIT
// ****
myApp.init = function() {
	console.log('* INIT', 'initialized');
	console.log('* Starting search listener');

	// Wait for user input
	myApp.setSearchListener();
}
