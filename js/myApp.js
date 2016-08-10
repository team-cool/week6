var myApp = {};

myApp.maxResults = 10;

myApp.goodReadsResult = {};
myApp.movieDBResult = {};

// Query Goodreads API with title
// https://www.goodreads.com/api
myApp.queryGoodReads = function(title) {
	console.log('**a Calling goodreads with title query');

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

	// Movie DB API with title
	// http://docs.themoviedb.apiary.io/#reference/search/searchmovie/get
myApp.queryMovieDB = function(title) {
	console.log('**b Calling movie DB with title query');

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
		console.log(data[0]);
		console.log(moviedbResponse[0]);
		console.log(`***a Goodreads returned: ${data[0].GoodreadsResponse.search.results.work[0].best_book.title}`);
		console.log(`***b Movie DB  returned: ${moviedbResponse[0].results[0].original_title}`);
		console.log(`***a Average rating for first Goodreads result: ${data[0].GoodreadsResponse.search.results.work[0].average_rating} out of 5`);
		console.log(`***b Avarage rating for first Movie DB  result: ${moviedbResponse[0].results[0].vote_average} out of 10`);

		myApp.goodReadsResult = data;
		myApp.movieDBResult = moviedbResponse;

		myApp.showSearchResults(data[0], moviedbResponse[0]);
	});
}

// Set listener for search button
myApp.setSearchListener = function() {
	$('#search-form').on('submit', function(event) {
		event.preventDefault();
		console.log('* Calling startNewGet()');
		var searchTerm = $('input[type=text]').val(); 
		myApp.startNewGet(searchTerm);

	});

	$('#compare-form').on('submit', function(event) {
		event.preventDefault();
		console.log('* Calling comparison');
		$('.comparisonSection').css('opacity', '1');
		$('.comparisonSection').css('display', 'flex');

		myApp.updateResultBoxes();

	});
}

myApp.updateResultBoxes = function() {
	$('#bookImage').attr('src', myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[0].best_book.image_url);	

	$('.bookResult h2').html(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[0].best_book.title);

	$('.bookResult p').text(myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[0].average_rating);

	$("#rateYoBook").rateYo({
	  rating: myApp.goodReadsResult[0].GoodreadsResponse.search.results.work[0].average_rating
	});

	$('#movieImage').attr('src', 'http://image.tmdb.org/t/p/w300' + myApp.movieDBResult[0].results[0].poster_path);


	$('.movieResult h2').text(myApp.movieDBResult[0].results[0].title);

	$('.movieResult p').text(myApp.movieDBResult[0].results[0].vote_average / 2);

	$("#rateYoMovie").rateYo({
	  rating: myApp.movieDBResult[0].results[0].vote_average / 2
	});


};


// Append results
myApp.showSearchResults = function(data1, data2) {

	// list 1
	var bookContainer = $('.booksResults');

	// list 2
	var moviesContainer = $('.moviesResults');

	// populate list 1
	for (i = 0; i < data1.GoodreadsResponse.search.results.work.length && i < myApp.maxResults; ++i) {
		var opt = $('<option>');
		opt.val(i);
	    opt.html(data1.GoodreadsResponse.search.results.work[i].best_book.title + " - " + data1.GoodreadsResponse.search.results.work[i].original_publication_year.$t); 

	    bookContainer.append(opt);
	}

	// populate list 2
	for (i = 0; i < data2.results.length && i < myApp.maxResults; ++i) {
		var opt = $('<option>');
		opt.val(i);
		console.log(data2.results[i].original_title);
	    opt.html(data2.results[i].original_title + " - " + data2.results[i].release_date.substring(0,4));
	    moviesContainer.append(opt); 
	}

	$('.firstResults').css('visibility', 'visible');
	$('.firstResults').css('opacity', '1');
	$('#search-form').css('transform', 'translate(-50%, calc(-50% - 100px))');
}



// Init
myApp.init = function() {
	console.log('* INIT', 'initialized');

	console.log('* Starting search listener');
	myApp.setSearchListener();

	// Hide first results window
	$('.firstResults').css('opacity', '0');
}

// Starts a new movie/book comparison query
myApp.startNewGet = function(title) {

	// Query Goodreads
	myApp.queryGoodReads(title);

	// Query movie DB
	myApp.queryMovieDB(title);

	// Start wait for ratings
	myApp.waitForRatings(title);
}