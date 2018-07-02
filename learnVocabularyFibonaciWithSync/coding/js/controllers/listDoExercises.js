angular.module('starter').controller('listDoExercisesCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonSql', '$DTA', '$commonFunc', '$ionicFilterBar', function($rootScope, $scope, $commonModel, $timeout, $commonSql, $DTA, $commonFunc, $ionicFilterBar) {
	$scope.model = $commonModel;
	$scope.init = function() {
		$scope.model.search.$ = '';
	};
	$scope.chooseLesson = function(item, exercise) {
		$scope.model.currentLesson = item;
		$commonFunc.getWordsOfLesson();
		$commonFunc.setView('#/mainLesson');
		if (exercise) {
			return;
		}
		$scope.toggleLeft();
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