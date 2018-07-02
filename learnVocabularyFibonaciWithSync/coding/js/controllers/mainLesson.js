angular.module('starter').controller('mainLessonCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonFunc', function($rootScope, $scope, $commonModel, $timeout, $commonFunc) {
	$scope.model = $commonModel;
	$scope.startLearnVocabulary = function() {
		$timeout(function() {
			var lesson = $scope.model.lessonList.filter(function(item) {
				return (item.idOffline == $scope.model.currentLesson.idOffline);
			});
			if (lesson != null && lesson.length > 0) {
				$scope.model.wordList = lesson[0].vocabulary;
			}
			$scope.model.wordList.forEach(function(item) {
				item.isRemember = 0;
			});
		});
		// cap nhat cac thuoc tinh cua lesson
		$commonFunc.setView('#/wordListLearn');
	};
}]);