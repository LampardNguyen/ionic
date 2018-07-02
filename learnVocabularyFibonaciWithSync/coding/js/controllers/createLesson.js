angular.module('starter').controller('createLessonCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$commonSql', '$DTA', '$commonFunc', '$ionicPopup', '$ionicFilterBar', '$tableName', function($rootScope, $scope, $commonModel, $timeout, $commonSql, $DTA, $commonFunc, $ionicPopup, $ionicFilterBar, $tableName) {
	$scope.model = $commonModel;
	$scope.init = function() {
		$scope.model.loading.show();
		$scope.model.currentClass.vocabulary = null;
		$scope.model.countWordsOfLesson = 5;
		$scope.resetCreateLesson();
	};
	$scope.resetCreateLesson = function() {
		$scope.model.lessonName = null;
		delete $scope.model.errorLessonName;
	};
	$scope.createLesson = function() {
		$scope.model.errorLessonName = false;
		$scope.model.errorLessonListWord = false;
		var isValid = $scope.model.currentClass.vocabulary.every(function(item) {
			return (item.isChecked != true);
		});
		if ($scope.model.lessonName == null || $scope.model.lessonName == '' || isValid) {
			if ($scope.model.lessonName == null || $scope.model.lessonName == '') {
				$scope.model.errorLessonName = true;
			}
			if (isValid) {
				$scope.model.errorLessonListWord = true;
			};
			return;
		} else {
			//insert to db lessons
			$commonFunc.getNextIdOfTable($tableName.Lessons, function(idOffline) {
				var itemLesson = {
					'idOffline': idOffline,
					'name': $scope.model.lessonName,
					'state': 0,
					'learnStartDate': '',
					'relearnDate': '',
					'nextLearnDate': '',
					'nextFibonaci': 3,
					'isLearned': 0,
					'countLearn': 0,
					'isDeleted': '',
					'deletedBy': '',
					'createdBy': $scope.model.currentUser.idOffline
				};
				$DTA.insertDataToTable($scope.model.db, $tableName.Lessons, itemLesson);
				var itemClasses_Lessons = {
					classId: $scope.model.currentClass.idOffline,
					lessonId: idOffline,
					isDeleted: '',
					deletedBy: '',
					createdBy: $scope.model.currentUser.idOffline
				};
				$DTA.insertDataToTable($scope.model.db, $tableName.ClassesLessons, itemClasses_Lessons);
				// insert to model
				var lesson = {
					idOffline: idOffline,
					name: $scope.model.lessonName,
					state: 0
				};
				$scope.model.currentClass.lessons.push(lesson);
				$scope.model.currentLesson = lesson;
				var vocabularu = [];
				var listVocabuRemove = [];
				$scope.model.currentClass.vocabulary.forEach(function(item, index) {
					if (item.isChecked == true && (angular.isUndefined(item.lessonId) || item.lessonId == null)) {
						// update word online
						var Objects = Parse.Object.extend($tableName.Words);
						var objects = new Parse.Query(Objects);
						objects.get(item.idOnline, {
							success: function(objectResult) {
								objectResult.set('isLearned', '1');
								objectResult.save();
							},
							error: function(objectErr, error) {}
						});
						item.isLearned = 1;
						item.lessonId = lesson.idOffline;
						vocabularu.push({
							idOffline: item.idOffline,
							english: item.english,
							vietnamese: item.vietnamese,
							example: item.example
						});
						// insert to db
						var itemLessons_words = {
							lessonId: idOffline,
							wordId: item.idOffline,
							isDeleted: '',
							deletedBy: '',
							createdBy: $scope.model.currentUser.idOffline
						};
						$DTA.insertDataToTable($scope.model.db, $tableName.LessonsWords, itemLessons_words);
						listVocabuRemove.push(index);
					}
				});
				listVocabuRemove.forEach(function(item, index) {
					$scope.model.currentClass.vocabulary.splice(item - index, 1);
				});
				lesson = {
					idOffline: idOffline,
					name: $scope.model.lessonName,
					vocabulary: vocabularu,
					learnStartDate: null,
					relearnDate: null,
					nextLearnDate: null,
					nextFibonaci: 3,
					isLearned: 0,
					state: 0,
					countLearn: 0
				};
				$scope.model.lessonList.push(lesson);
				$scope.resetCreateLesson();
				$scope.confirmLearnNow();
			});
		}
	};
	$scope.confirmLearnNow = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Create done!',
			template: 'Are you sure you want to learn now?'
		});
		confirmPopup.then(function(res) {
			if (res) {
				$commonFunc.setView('#/mainLesson');
			}
		});
	};
	$scope.changeCountWordOfLesson = function() {
		$scope.model.currentClass.vocabulary.forEach(function(item) {
			if (item.isChecked == true && item.isLearned != 1) {
				item.isChecked = false;
			}
		});
		var count = 0;
		for (var j = 0; j < $scope.model.vocabularyCreateLesson.length; j++) {
			$scope.model.vocabularyCreateLesson[j].isChecked = true;
			for (var i = $scope.model.currentClass.vocabulary.length - 1; i >= 0; i--) {
				if ($scope.model.currentClass.vocabulary[i].idOffline == $scope.model.vocabularyCreateLesson[j].idOffline) {
					$scope.model.currentClass.vocabulary[i].isChecked = true;
					break;
				}
			}
			++count;
			if (count == $scope.model.countWordsOfLesson || count == $scope.model.currentClass.vocabulary.length) {
				break;
			}
		}
	};
	$scope.countCheck = function() {
		if (angular.isUndefined($scope.model.currentClass)) {
			return;
		}
		$scope.model.countWordsOfLesson = _.countBy($scope.model.currentClass.vocabulary, function(item) {
			return item.isChecked == 1 && item.isLearned != 1 ? 'length' : 'null';
		}).length;
	};
	$scope.changeCountWordOfLesson = function() {
		$scope.model.currentClass.vocabulary.forEach(function(item) {
			if (item.isChecked == true && item.isLearned != 1) {
				item.isChecked = false;
			}
		});
		var count = 0;
		for (var j = 0; j < $scope.model.vocabularyCreateLesson.length; j++) {
			$scope.model.vocabularyCreateLesson[j].isChecked = true;
			for (var i = $scope.model.currentClass.vocabulary.length - 1; i >= 0; i--) {
				if ($scope.model.currentClass.vocabulary[i].idOffline == $scope.model.vocabularyCreateLesson[j].idOffline) {
					$scope.model.currentClass.vocabulary[i].isChecked = true;
					break;
				}
			}
			++count;
			if (count == $scope.model.countWordsOfLesson || count == $scope.model.currentClass.vocabulary.length) {
				break;
			}
		}
	};
	$scope.showFilterBar = function() {
		var filterBarInstance = $ionicFilterBar.show({
			items: $scope.model.currentClass.vocabulary,
			update: function(filteredItems, filterText) {
				$scope.model.currentClass.vocabulary = filteredItems;
			}
		});
	};
}]);