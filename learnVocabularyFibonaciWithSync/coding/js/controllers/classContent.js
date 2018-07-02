angular.module('starter').controller('classContentCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonFunc', '$ionicPopup', '$DTA', '$tableName', function($rootScope, $scope, $commonModel, $timeout, $commonFunc, $ionicPopup, $DTA, $tableName) {
	$scope.model = $commonModel;
	$scope.showModalAddNewWords = function() {
		$commonFunc.setView('#/addNewWords');
	};
	$scope.showCreateLesson = function() {
		$commonFunc.setView('#/createLesson');
		//loading words of class
		$scope.getWordOfClass(0);
	};
	$scope.showDoExcercises = function() {
		$scope.getLessonOfClass($scope.model.currentClass);
		$commonFunc.setView('#/listDoExercises');
	};
	$scope.showWordsNotLearnYet = function() {
		$scope.model.loading.show();
		$commonFunc.setView('#/wordsNotLearnYet');
		$timeout(function() {
			$scope.getWordOfClass(0);
		});
	};
	$scope.showAllWordOfClass = function() {
		$scope.getWordOfClass();
		$commonFunc.setView('#/allWordOfClass');
	};
	$scope.showManageLessons = function() {
		$scope.getLessonOfClass($scope.model.currentClass);
		$commonFunc.setView('#/manageLessons');
	};
	$scope.getLessonOfClass = function(classes) {
		classes.lessons = [];
		var where = {
			classId: classes.idOffline
		}
		$DTA.selectTableWhere($scope.model.db, $tableName.ClassesLessons, where).then(function(result) {
			_.each(result.rows, function(item) {
				var where = {
					idOffline: item.lessonId
				};
				$DTA.selectTableWhere($scope.model.db, $tableName.Lessons, where).then(function(resultChild) {
					classes.lessons.push(resultChild.rows[0]);
				}, function(err) {});
			});
		}, function(err) {
			console.log(err);
		});
	};
	$scope.selectRemoveClass = function(classes) {
		event.stopPropagation();
		if (angular.isUndefined($scope.showConfirmRemoveClass)) {
			$scope.showConfirmRemoveClass = function(classes) {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Warnig',
					template: 'Are you sure want to remove this class?'
				});
				confirmPopup.then(function(res) {
					if (res) {
						$scope.model.loading.show();
						$commonFunc.removeClass(classes, true);
						$commonFunc.setView('#/main');
					} else {}
				});
			};
		}
		$scope.showConfirmRemoveClass(classes);
	};
	$scope.getWordOfClass = function(state) {
		// load ClassesWords
		$scope.model.currentClass.vocabulary = [];
		var where = {
			classId: $scope.model.currentClass.idOffline
		}
		$DTA.selectTableWhere($scope.model.db, $tableName.ClassesWords, where).then(function(result) {
			if (result.rows.length == 0) {
				$scope.model.loading.hide();
				$scope.model.currentClass.vocabulary = [];
				return;
			}
			var arrWhere = [];
			_.each(result.rows, function(item) {
				arrWhere.push([item.wordId]);
			});
			$DTA.selectAllWordsOfClasses($scope.model.db, arrWhere, state).then(function(resultChild) {
				$scope.model.currentClass.vocabulary = resultChild;
				$scope.model.loading.hide();
			}, function(err) {
				console.log(err);
			});
			arrWhere = [];
		}, function(err) {
			console.log(err);
		});
	};
}]);