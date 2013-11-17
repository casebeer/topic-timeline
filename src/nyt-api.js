window.NYTAPI = (function () {
	var baseUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.jsonp?',
		queryBad = 'fq=glocations:(%22Brooklyn%20(NYC)%22)&api-key=';

	function dateRanges() {
		// get start and end dates for intervals going back 10, then 20, 40, and 80 years
		var endYear = (new Date()).getFullYear(),
			startYear,
			intervalLengths = [10, 20, 40, 100],
			intervals = [],
			i;
		for (i = 0; i < intervalLengths.length; i++) { 
			startYear = endYear - intervalLengths[i]; 
			intervals.push([ String(startYear) + "0101", String(endYear) + "1231" ]); 
			endYear = startYear;
		}
		return intervals;
	}
	
	function serializeQuery(obj) {
		var query = [];
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				query.push([
					encodeURIComponent(String(key)), 
					encodeURIComponent(String(obj[key]))
				].join('='));
			}
		}
		return query.join('&');
	}

	function getUrls(searchTerm, apiKey, callbackArg) {
		var intervals = dateRanges(),
			i,
			startDate,
			endDate,
			callback = callbackArg || 'JSON_CALLBACK',
			urls = [];

		for (i = 0; i < intervals.length; i++) {
			startDate = intervals[i][0];
			endDate = intervals[i][1];

			urls.push(baseUrl + serializeQuery({
				'api-key': apiKey,
				'callback': callback,
				'q': searchTerm,
				'begin_date': startDate,
				'end_date': endDate
			}));
		}

		return urls;
	}

	return {
		getUrls: getUrls 
	};
}());
