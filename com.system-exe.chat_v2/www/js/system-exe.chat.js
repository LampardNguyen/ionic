(function() {
	angular.module('system-exe.chat', ['firebase']);
	angular.module('system-exe.chat').value("$systemConfig", {
		appId: 'system-exe-chat',
		status: ['pending', 'approved', 'rejected'],
		statusObj: {
			offline: 0,
			online: 1,
			pending: 2,
			approved: 3,
			rejected: 4,
			new: 5
		},
		groupId: null
	});
	angular.module('system-exe.chat').factory("$systemCommon", ['$firebaseArray', '$systemConfig', '$q', function($firebaseArray, $systemConfig, $q) {
		var model = {
			objectToArray: function(object) {
				var list = [];
				for (var item in object) {
					list.push(object[item]);
				};
				return list;
			},
			getUser: function(orderBy, equalTo) {
				var self = this;
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/users");
				itemsRef.orderByChild(orderBy).equalTo(equalTo).limitToFirst(1).on('value', function(success) {
					var list = self.objectToArray(success.val());
					q.resolve(list[0]);
				}, function(err) {
					q.reject(err);
				});
				return q.promise; // $firebaseArray(query);
			},
			searchUser: function(orderBy, startAt) {
				var self = this;
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/users");
				itemsRef.orderByChild(orderBy).startAt(startAt).on('value', function(success) {
					var list = self.objectToArray(success.val());
					q.resolve(list[0]);
				}, function(err) {
					q.reject(err);
				});
				return q.promise; // $firebaseArray(query);
			},
			getUsers: function() {
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/users");
				var list = $firebaseArray(itemsRef);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getFriends: function() {
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/user_friends");
				var list = $firebaseArray(itemsRef);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getOwnFriends: function(orderBy, equalTo) {
				var self = this;
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/user_friends");
				var query = itemsRef.orderByChild(orderBy).equalTo(equalTo);
				query.on('value', function(success) {
					var list = self.objectToArray(success.val());
					q.resolve(list);
				}, function(err) {
					q.reject(err);
				});
				return q.promise; // $firebaseArray(query);
			},
			getMyFriendList: function(userId) {
				var q = $q.defer();
				var self = this;
				self.getOwnFriends('userId', userId).then(function(success) {
					var allFriends = success;
					var listFriend = [];
					angular.forEach(allFriends, function(item) {
						self.getUser('id', item.friendId).then(function(user) {
							user.isFriend = true;
							user.messageCount = item.messageCount;
							if (item.status == $systemConfig.statusObj.pending) {
								user.status = $systemConfig.statusObj.pending;
								user.requestFrom = item.requestFrom;
								user.isFriend = false;
							}
							//  else if (item.status == $systemConfig.statusObj.approved) {
							// 	user.status = $systemConfig.statusObj.online;
							// }
							if (item.status != $systemConfig.statusObj.rejected) {
								listFriend.push(user);
							}
							if (allFriends.length == listFriend.length) {
								q.resolve(listFriend);
							}
						}, function(err) {});
					});
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getGroup: function(orderBy, equalTo) {
				var self = this;
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/groups");
				itemsRef.orderByChild(orderBy).equalTo(equalTo).limitToFirst(1).on('value', function(success) {
					var list = self.objectToArray(success.val());
					q.resolve(list[0]);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getGroups: function(orderBy, equalTo) {
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/groups");
				var query = itemsRef.orderByChild(orderBy).equalTo(equalTo);
				var list = $firebaseArray(query);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getUserGroups: function() {
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/user_groups");
				var list = $firebaseArray(itemsRef);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getOwnGroups: function(orderBy, equalTo) {
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/user_groups");
				var query = itemsRef.orderByChild(orderBy).equalTo(equalTo);
				var list = $firebaseArray(query);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getMyGroupList: function(userId) {
				var q = $q.defer();
				var self = this;
				self.getOwnGroups('userId', userId).then(function(success) {
					var allGroups = success;
					var listGroup = [];
					angular.forEach(allGroups, function(item) {
						self.getGroup('id', item.gruopId).then(function(group) {
							listGroup.push(group);
							if (allGroups.length == listGroup.length) {
								q.resolve(listGroup);
							}
						}, function(err) {});
					});
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getAllFriendInGroup: function(groupId) {
				var q = $q.defer();
				var self = this;
				self.getOwnGroups('gruopId', groupId).then(function(success) {
					var allGroups = success;
					var listGroup = [];
					angular.forEach(allGroups, function(item) {
						self.getUser('id', item.userId).then(function(user) {
							listGroup.push(user);
							if (allGroups.length == listGroup.length) {
								q.resolve(listGroup);
							}
						}, function(err) {});
					});
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getMessages: function(orderBy, equalTo) {
				var self = this;
				var q = $q.defer();
				var itemsRef = new Firebase("https://" + $systemConfig.appId + ".firebaseio.com/messages");
				var query = itemsRef.orderByChild(orderBy).equalTo(equalTo);
				var list = $firebaseArray(query);
				list.$loaded(function(success) {
					q.resolve(success);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			}
		};
		return model;
	}]);
	angular.module('system-exe.chat').factory('$systemAuth', ['$q', '$firebaseAuth', '$systemCommon', function($q, $firebaseAuth, $systemCommon) {
		var usersRef = new Firebase("https://system-exe-chat.firebaseio.com/auths");
		var model = {
			Auth: $firebaseAuth(usersRef),
			login: function(email, password) {
				var q = $q.defer();
				this.Auth.$authWithPassword({
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
				this.Auth.$createUser(params).then(function(success) {
					console.log(success);
					$systemCommon.getUsers().then(function(users) {
						var item = {
							username: params.email,
							id: success.uid,
							status: 1
						};
						users.$add(item);
					}, function(err) {});
					q.resolve(success);
				}).catch(function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			checkAuthen: function() {
				var q = $q.defer();
				this.Auth.$requireAuth().then(function(success) {
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