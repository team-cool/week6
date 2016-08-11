var myApp = {};

// Max results to display in dropdowns
// after saerch
myApp.maxResults = 10;

// Goodreads & movieDB return containers
myApp.goodReadsResult = {};
myApp.movieDBResult = {};

// ********************************
// Set listeners for search buttons
myApp.setSearchListener = function() {

	// Listener for the 1st submit
	// After the user provides input for book/movie name
	$('#search-form').on('submit', function(event) {
		event.preventDefault();
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
		$('.comparisonSection').css('opacity', '1');
		$('.comparisonSection').css('display', 'flex');

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



//

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
	$('.firstResults').css('visibility', 'visible');
	$('.firstResults').css('opacity', '1');

	// Move the search box up
	$('#search-form').css('transform', 'translate(-50%, calc(-50% - 50px))');
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
	$('#bookImage').attr('src', bookImageUrl);	
	$('.bookResult h2').html(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].best_book.title);
	$('.bookResult p').text(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].average_rating);
	$("#rateYoBook").rateYo({
	  rating: myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[whichBook].average_rating
	});

	// Set movie image, title, year & stars
	$('#movieImage').attr('src', 'http://image.tmdb.org/t/p/w300' + myApp.movieDBResult[0].results[whichMovie].poster_path);
	$('.movieResult h2').text(myApp.movieDBResult[0].results[whichMovie].title);
	$('.movieResult p').text(myApp.movieDBResult[0].results[whichMovie].vote_average / 2);
	$("#rateYoMovie").rateYo({
	  rating: myApp.movieDBResult[0].results[whichMovie].vote_average / 2
	});
};

// ****
// INIT
// ****
myApp.init = function() {
	console.log('* INIT', 'initialized');
	console.log('* Starting search listener');

	// Wait for user input
	myApp.setSearchListener();
}