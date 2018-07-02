(function() {
	angular.module('modelModule', []);
	angular.module('modelModule').factory('$commonModel', [function() {
		var model = {
			mainView: '#/main',
			view: '#/main',
			viewList: ['#/main'], 
			classList: [],
			wordList: [],
			lessonList: [],
			lessonListOfClass: [],
			newWordList: [],
			newWordListTmp: [],
			words: [],
			classes: [],
			fibonacci: [],
			needExercisesCount: 0,
			doExercisesNeedList: [],
			maxCountLearn: 10,
			countWordsOfLesson: 5,
			rootDirectory: 'file:///storage/emulated/0/',
			search: {}
		};
		return model;
	}]);
	angular.module('modelModule').constant('$tableName', {
		Lessons: 'Lessons',
		Classes: 'Classes',
		Words: 'Words',
		ClassesWords: 'ClassesWords',
		ClassesLessons: 'ClassesLessons',
		LessonsWords: 'LessonsWords',
		Configs: 'Configs',
		Fibonacci: 'Fibonacci',
		Users: 'Users'
	});
})();