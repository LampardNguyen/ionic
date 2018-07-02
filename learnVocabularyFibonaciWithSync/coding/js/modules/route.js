angular.module('starter').config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $translateProvider) {
	$stateProvider.state('main', {
		url: '/main',
		templateUrl: 'templates/main.html'
	}).state('addNewWords', {
		url: '/addNewWords',
		templateUrl: 'templates/addNewWords.html',
		controller: 'addNewWordCtrl',
	}).state('allWordOfClass', {
		url: '/allWordOfClass',
		templateUrl: 'templates/allWordOfClass.html',
		controller: 'allWordOfClassCtrl',
	}).state('classContent', {
		url: '/classContent',
		templateUrl: 'templates/classContent.html',
		controller: 'classContentCtrl'
	}).state('createLesson', {
		url: '/createLesson',
		templateUrl: 'templates/createLesson.html',
		controller: 'createLessonCtrl'
	}).state('listDoExercises', {
		url: '/listDoExercises',
		templateUrl: 'templates/listDoExercises.html',
		controller: 'listDoExercisesCtrl'
	}).state('mainLesson', {
		url: '/mainLesson',
		templateUrl: 'templates/mainLesson.html',
		controller: 'mainLessonCtrl'
	}).state('manageLessons', {
		url: '/manageLessons',
		templateUrl: 'templates/manageLessons.html',
		controller: 'manageLessonsCtrl'
	}).state('wordListLearn', {
		url: '/wordListLearn',
		templateUrl: 'templates/wordListLearn.html',
		controller: 'wordListLearnCtrl'
	}).state('wordsNotLearnYet', {
		url: '/wordsNotLearnYet',
		templateUrl: 'templates/wordsNotLearnYet.html',
		controller: 'wordsNotLearnYetCtrl'
	}).state('doExercisesNeedList', {
		url: '/doExercisesNeedList',
		templateUrl: 'templates/doExercisesNeedList.html',
		controller: 'doExercisesNeedListCtrl'
	}).state('setting', {
		url: '/setting',
		templateUrl: 'templates/setting.html',
		controller: 'settingCtrl'
	}).state('profile', {
		url: '/profile',
		templateUrl: 'templates/profile.html',
		controller: 'profileCtrl'
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/main');
	$translateProvider.useStaticFilesLoader({
		prefix: 'locallize/label-',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage(navigator.language);
	$translateProvider.useLocalStorage();
	$translateProvider.useSanitizeValueStrategy('sanitize');
}]);