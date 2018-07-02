angular.module('starter').controller('doExercisesNeedListCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonFunc', function($rootScope, $scope, $commonModel, $timeout, $commonFunc) {
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
}]);