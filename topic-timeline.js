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
angular.module('topicTimeline', []);
angular.module('topicTimeline').directive('topicTimeline', function ($q, $http, $timeout) {
	return {
		restrict: 'AE',
		template: '<div id="{{ embedId }}"></div>' 
			+ '<p><a href="http://developer.nytimes.com/"><img src="http://graphics8.nytimes.com/packages/images/developer/logos/poweredby_nytimes_150a.png" /></a></p>',
		scope: {
			searchTerm: '@',
			apiKey: '@'
		},
		link: function ($scope, elt, attrs) {
			var canvas = elt.find('canvas')[0];

			$scope.embedId = 'id' + Math.floor(Math.random() * 10000000);
			$scope.$watch('[searchTerm]', 
				function (newValue, oldValue) {

					getApiData($scope.searchTerm, $scope.apiKey)
						.then(createTimelineData)
						.then(drawTimeline);

				}, 
				true
			);

			function getApiData(searchTerm, apiKey) {
				var deferred = $q.defer(),
					urls = NYTAPI.getUrls(searchTerm, apiKey, 'svc_search_v2_articlesearch'),
					i,
					results = [],
					HTTP_ALL_CALLS_TIMEOUT_MS = 9000;

				// HORRIBLE HACK FOR TOTALLY BROKEN NYT JSONP
				window.svc_search_v2_articlesearch = function (data) {
					results.push(data);
					if (results.length === urls.length) {
						// got all results
						deferred.resolve(results);
					}
				};

				// todo: configure timeouts and error behavior
				for (i = 0; i < urls.length; i++) {
					$http.jsonp(urls[i]);
				}

				// if some of the JSONP calls timeout, just continue on without data
				$timeout(function () {
					deferred.resolve(results);
				}, HTTP_ALL_CALLS_TIMEOUT_MS);

				return deferred.promise;
			}

			function createTimelineData(apiData) {
				var deferred = $q.defer(),
					i,
					j,
					articlesPerPeriod = 3,
					result,
					timelineDates = [];

				// todo: configure timelineData general stuff

				function articleToEvent(article) {
					var date = article.pub_date.split('T')[0].split('-').join(','),
						event_ = {
							startDate: date,
							endDate: date,
							headline: article.headline.main,
							text: article.lead_paragraph || article.snippet
						};
					// todo: template text?
					// todo: images
					return event_;
				}

				for (i = 0; i < apiData.length; i++) {
					result = apiData[i];
					for (j = 0; j < articlesPerPeriod; j++) {
						timelineDates.push(articleToEvent(result.response.docs[j]))
					}
				}

				// todo: async and chunked?
				deferred.resolve({
					timeline: {
						headline: '',
						type: 'default',
						text: '',
						date: timelineDates
					}
				});

				return deferred.promise;
			}

			function drawTimeline(timelineData) {
				// redraw Timeline.js
				// todo: make timeline.js config options configurable
				console.log(timelineData);
				createStoryJS({
					type: 'timeline',
					embed_id: $scope.embedId,
					width: '100%',
					height: '650',
					source: timelineData
				});
			}
		}
	};
});
