angular.module('nytTimeline', []);
angular.module('nytTimeline').directive('nytTimeline', function ($q, $http, $timeout) {
	return {
		restrict: 'AE',
		template: '<div id="{{ embedId }}"></div>',
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
					promises = [],
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
					//promises.push($http.jsonp(urls[i]));
					$http.jsonp(urls[i]);
				}

				// if some of the JSONP calls timeout, just continue on without data
				$timeout(function () {
					deferred.resolve(results);
				}, HTTP_ALL_CALLS_TIMEOUT_MS);

//				$q.all(promises).then(function (results) {
//					deferred.resolve(results);
//				});

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
					width: '100%',
					height: '650',
					embed_id: $scope.embedId,
					source: timelineData,
					css: 'vendor/timelinejs/css/timeline.css',
					js: 'vendor/timelinejs/js/timeline-min.js'
				});
			}
		}
	};
});
