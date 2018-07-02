angular.module('starter').controller('manageLessonsCtrl', ['$rootScope', '$scope', '$commonModel', '$ionicPopup', '$ionicListDelegate', '$DTA', '$ionicFilterBar', '$tableName', function($rootScope, $scope, $commonModel, $ionicPopup, $ionicListDelegate, $DTA, $ionicFilterBar, $tableName) {
	$scope.model = $commonModel;
	$scope.init = function() {
		$scope.model.search.$ = '';
	};
	$scope.resetLesson = function(lesson) {
		lesson.countLearn = 0;
		lesson.isLearned = 0;
		lesson.learnStartDate = '';
		lesson.nextFibonaci = 3;
		lesson.nextLearnDate = '';
		lesson.relearnDate = '';
		lesson.state = 0;
		var itemLesson = {
				countLearn: 0,
				isLearned: 0,
				learnStartDate: "",
				nextFibonaci: 3,
				nextLearnDate: "",
				relearnDate: "",
				state: 0
			},
			where = {
				idOffline: lesson.idOffline
			};
		$DTA.updateTable($scope.model.db, 'Lessons', itemLesson, where);
	};
	$scope.showPopupRenameLesson = function(lesson) {
		$ionicPopup.prompt({
			title: 'Rename lesson',
			inputType: 'text',
			inputPlaceholder: 'Enter new lesson',
		}).then(function(res) {
			if (angular.isUndefined(res) || res == null || res == '') {
				return;
			}
			if (angular.isUndefined($scope.renameLesson)) {
				$scope.renameLesson = function(lesson) {
					var updateLesson = {
						name: res
					};
					var whereLesson = {
						idOffline: lesson.idOffline
					}
					$DTA.updateTable($scope.model.db, 'Lessons', updateLesson, whereLesson);
					lesson.name = res;
					$scope.shownGroup = null;
					$ionicListDelegate.closeOptionButtons();
				};
			}
			$scope.renameLesson(lesson);
		});
	};
	$scope.selectRemoveLesson = function(lesson) {
		if (angular.isUndefined($scope.showConfirmRemoveLesson)) {
			$scope.showConfirmRemoveLesson = function(lesson) {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Warnig',
					template: 'Are you sure want to remove this lesson?'
				});
				confirmPopup.then(function(res) {
					if (res) {
						$scope.removeLesson(lesson);
						$ionicListDelegate.closeOptionButtons();
					} else {}
				});
			};
		}
		$scope.showConfirmRemoveLesson(lesson);
	};
	$scope.removeLesson = function(lesson) {
		//remove ClassesLessons
		var whereClassesLesson = {
			lessonId: lesson.idOffline
		};
		$DTA.deleteTable($scope.model, $tableName.ClassesLessons, whereClassesLesson);
		//remove class in list show
		var lessonIndex = _.findIndex($scope.model.currentClass.lessons, function(item) {
			return (item.idOffline == lesson.idOffline);
		});
		$scope.model.currentClass.lessons.splice(lessonIndex, 1);
	};
	$scope.showFilterBar = function() {
		var filterBarInstance = $ionicFilterBar.show({
			items: $scope.model.currentClass.lessons,
			update: function(filteredItems, filterText) {
				$scope.model.currentClass.lessons = filteredItems;
			}
		});
	};
}]);