function Common($q, $http) {
	var deferred = $q.defer();
	this.getUserByLogin = function(login) {
		$http.get('http://api.quickblox.com/users/by_login.json?login=' + login).success(function(data, status, headers, config) {
			deferred.resolve(data);
		}).error(function(data, status, headers, config) {
			deferred.reject(data);
		});
		return deferred.promise;
	};
};
Common.$injector = ['$q', '$http'];
angular.module('starter').service('Common', Common);