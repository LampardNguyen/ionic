(function() {
	angular.module('funcModule', ['commonModule', 'commonDTA', 'modelModule']);
	angular.module('funcModule').service('$commonFunc', ['$DTA', '$commonModel', '$window', '$ionicFilterBar', '$q', '$tableName', '$tableName', function($DTA, $commonModel, $window, $ionicFilterBar, $q, $tableName, $tableName) {
		this.getNextIdOfTable = function(tableName, fnCallback) {
			$DTA.getNextIdOfTable($commonModel.db, tableName).then(function(result) {
				fnCallback(result);
			}, function(err) {
				console.log(err);
			});
		};
		this.setView = function(view) {
			if (view == $commonModel.viewList[$commonModel.viewList.length - 1]) {
				return;
			}
			$commonModel.viewList.push(view);
			$commonModel.view = view;
			$window.location = view;
		};
		this.getWordsOfLesson = function(fnCallback) {
			// load lesson
			$commonModel.currentLesson.vocabulary = [];
			$commonModel.lessonList.push($commonModel.currentLesson);
			// load LessonsWords
			var where = {
				lessonId: $commonModel.currentLesson.idOffline
			}
			$DTA.selectTableWhere($commonModel.db, $tableName.LessonsWords, where).then(function(resultC) {
				_.each(resultC.rows, function(item) {
					where = {
						idOffline: item.wordId
					};
					$DTA.selectTableWhere($commonModel.db, $tableName.Words, where).then(function(resultChild) {
						$commonModel.currentLesson.vocabulary.push(resultChild.rows[0]);
					}, function(err) {
						console.log(err);
					});
				});
			}, function(err) {
				console.log(err);
			});
			(fnCallback || angular.noop)();
		};
		this.removeClass = function(classes, stop) {
			//remove class
			$DTA.deleteTable($commonModel, $tableName.Classes, {
				idOffline: classes.idOffline
			});
			//remove class in list show
			var classIndex = _.findIndex($commonModel.classList, function(item) {
				return (item.idOffline == classes.idOffline);
			});
			$commonModel.classList.splice(classIndex, 1);
			if (stop == true) {
				$commonModel.loading.hide();
			}
		};
		this.checkIsOnline = function() {
			var defer = $q.defer();
			var checkIsOnline = Parse.Object.extend("Object");
			var query = new Parse.Query(checkIsOnline);
			query.get(null, {
				success: function(checkIsOnline) {},
				error: function(object, error) {
					defer.resolve(error.code)
				}
			});
			return defer.promise;
		};
	}]);
})();