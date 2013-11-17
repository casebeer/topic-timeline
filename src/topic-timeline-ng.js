angular.module('topicTimeline', []);
angular.module('topicTimeline').directive('topicTimeline',
	['$q', '$http', '$timeout',
	function ($q, $http, $timeout) {
	return {
		restrict: 'AE',
		template: '<div id="{{ embedId }}"></div>' 
			+ '<p><a href="http://developer.nytimes.com/">'
			+ '<img src="http://graphics8.nytimes.com/packages/images/developer/logos/poweredby_nytimes_150a.png" />'
			+ '</a></p>',
		scope: {
			searchTerm: '@',
			apiKey: '@'
		},
		link: function ($scope, elt, attrs) {
			$scope.embedId = 'id' + Math.floor(Math.random() * 10000000);
			$scope.$watch('[searchTerm]', 
				function (newValue, oldValue) {
					// todo: only run search when searchTerm is quiescent to avoid hammering API
					// todo: rate limit searches; at least wait until previous promises resolved
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
						// got all results, so we can resolve the promise will all data
						// (though trouble if previous results were still in flight
						//  – nothing to do about that, since NYT doesn't support custom
						// JSONP callback names, and Angular can't cancel a JSONP script
						// embed.)
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

				// todo: configure timelineData general (i.e. not per-event) content
				// todo: template text?

				function articleToEvent(article) {
					var date = article.pub_date.split('T')[0].split('-').join(','),
						text = article.lead_paragraph || article.snippet || '',
						link = '<p><a href="' + article.web_url + '">read more...</a><p>',
						event_,
						image,
						i;
					text = '<p>' + text + '</p>';
					event_ = {
						startDate: date,
						endDate: date,
						headline: article.headline.main,
						text: text + link
					};
					// todo: break out image retrieval into separate function
					for (i = 0; i < article.multimedia.length; i++) {
						image = article.multimedia[i];
						if (image.type === 'image' 
							&& (image.subtype === 'wide' || image.subtype === 'xlarge')) {
							event_.asset = {
								media: 'http://www.nytimes.com/' + image.url
							};
							break;
						}
					}
					return event_;
				}

				for (i = 0; i < apiData.length; i++) {
					result = apiData[i];
					for (j = 0; j < articlesPerPeriod; j++) {
						timelineDates.push(articleToEvent(result.response.docs[j]))
					}
				}
				deferred.resolve({
					timeline: {
						headline: 'Stories matching "' + $scope.searchTerm + '" from 1851 to '
							+ String((new Date()).getFullYear()),
						type: 'default',
						text: 'Articles from the New York Times archives',
						date: timelineDates
					}
				});
				return deferred.promise;
			}

			function drawTimeline(timelineData) {
				// redraw Timeline.js
				// todo: make timeline.js config options configurable
				// todo: promise so we can have actions after everything is complete
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
}]);
