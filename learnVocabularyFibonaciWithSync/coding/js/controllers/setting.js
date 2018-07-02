angular.module('starter').controller('settingCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$ionicPopup', '$commonFunc', '$DTA', '$tableName', '$translate', function($rootScope, $scope, $commonModel, $timeout, $ionicPopup, $commonFunc, $DTA, $tableName, $translate) {
	$scope.model = $commonModel;
	$scope.setDefault = function() {
		var objUpdate = {
			value: 10
		}
		var objUpdateWhere = {
			name: 'maxCountLearn',
			createdBy: $scope.model.currentUser.idOnline
		}
		$DTA.updateTable($scope.model.db, $tableName.Configs, objUpdate, objUpdateWhere).then(function(result) {
			$scope.model.maxCountLearn = 10;
		}, function(err) {});
	};
	$scope.saveConfig = function() {
		$scope.model.loading.show();
		if ($scope.model.isChangeCountLearn == true) {
			//update maxCountLearn
			var maxCountLearnUpdate = {
				value: $scope.model.maxCountLearn
			};
			var maxCountLearnWhere = {
				name: 'maxCountLearn',
				createdBy: $scope.model.currentUser.idOnline
			};
			$DTA.updateTable($scope.model.db, $tableName.Configs, maxCountLearnUpdate, maxCountLearnWhere);
		}
		if ($scope.model.isChangeLanguage == true) {
			//update languageLearn
			var languageLearnUpdate = {
				value: $scope.model.languageItem
			};
			var languageLearnWhere = {
				name: 'languageLearn',
				createdBy: $scope.model.currentUser.idOnline
			};
			$DTA.updateTable($scope.model.db, $tableName.Configs, languageLearnUpdate, languageLearnWhere).then(function(result) {
				$scope.model.loading.hide();
				$scope.loadDataFromDb($scope.model.db);
			}, function(err) {});
		} else {
			$scope.model.loading.hide();
		}
		$translate.use($scope.model.languageDisplay);
	};
	$scope.clearData = function() {
		if (angular.isUndefined($scope.showConfirmClearData)) {
			$scope.showConfirmClearData = function() {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Clear data',
					template: 'All class and setting will be clear'
				});
				confirmPopup.then(function(res) {
					if (res) {
						$scope.model.loading.show();
						var countClear = 0,
							lengthClass = angular.copy($scope.model.classes.length);
						$scope.model.classes.forEach(function(item, index) {
							countClear++;
							$commonFunc.removeClass(item, false);
						});
						setInterval(function() {
							if (countClear == lengthClass) {
								$scope.model.loading.hide();
							}
						}, 1000);
					}
				});
			};
		}
		$scope.showConfirmClearData();
	};
	$scope.changeCountLearn = function(){
		$scope.model.isChangeCountLearn = true;
	};
	$scope.changeLanguage = function(){
		$scope.model.isChangeLanguage = true;
	};
}]);