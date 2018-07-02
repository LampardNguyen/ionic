angular.module('starter').controller('profileCtrl', ['$rootScope', '$scope', '$commonModel', '$timeout', '$tableName', '$DTA', function($rootScope, $scope, $commonModel, $timeout, $tableName, $DTA) {
	$scope.model = $commonModel;
	$scope.init = function() {
		var user = angular.fromJson(localStorage.user);
		$scope.model.username = user.username;
	};
	$scope.saveUsername = function(model) {
		var usernameValue = {
				username: CryptoJS.SHA3(angular.copy(model.username), {
					outputLength: 224
				}).toString()
			},
			where = {
				idOffline: $scope.model.currentUser.idOffline
			};
		$DTA.updateTable($scope.model.db, $tableName.Users, usernameValue, where);
		var user = {
			username: model.username,
			password: angular.fromJson(localStorage.user).password
		};
		localStorage.user = angular.toJson(user);
	};
	$scope.savePassword = function(model) {
		if ($scope.model.password != $scope.model.confirmPassword) {
			return;
		}
		var passwordValue = {
				password: CryptoJS.SHA3(angular.copy(model.password), {
					outputLength: 224
				}).toString()
			},
			where = {
				idOffline: $scope.model.currentUser.idOffline
			};
		$DTA.updateTable($scope.model.db, $tableName.Users, passwordValue, where);
		var user = {
			username: angular.fromJson(localStorage.user).username,
			password: model.password
		};
		localStorage.user = angular.toJson(user);
	};
}]);