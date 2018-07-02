
(function() {
	angular.module('system-exe.chat', ['firebase']);
	angular.module('system-exe.chat').factory("Items", function($firebaseArray) {
		var itemsRef = new Firebase("https://system-exe-chat.firebaseio.com/items");
		return $firebaseArray(itemsRef);
	});
	angular.module('system-exe.chat').factory("Auth", function($firebaseAuth) {
		var usersRef = new Firebase("https://system-exe-chat.firebaseio.com/users");
		return $firebaseAuth(usersRef);
	});
	angular.module('system-exe.chat').factory('$systemChat', ['$q', 'Auth', 'Items', function($q, Auth, Items) {
		var model = {
			login: function(email, password) {
				var q = $q.defer();
				Auth.$authWithPassword({
					email: email,
					password: password
				}).then(function(success) {
					q.resolve(success);
				}).catch(function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			sigup: function(params) {
				var q = $q.defer();
				Auth.$createUser(params).then(function(success) {
					q.resolve(success);
				}).catch(function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			checkAuthen: function() {
				var q = $q.defer();
				Auth.$requireAuth().then(function(success) {
					q.resolve(success);
				}).catch(function(err) {
					q.reject(err);
				});
				return q.promise;
			}
		};
		return model;
	}]);
})();