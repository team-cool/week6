var myApp = {};

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
	});
}

// Init
myApp.init = function() {
	console.log('* INIT', 'initialized');

	console.log('* Calling startNewGet()');
	myApp.startNewGet('The Matrix');
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