(function() {
	angular.module('commonModule', []);
	angular.module('commonModule').factory('$commonSql', ['$q', function($q) {
		var model = {
			getwhereFromObjectWhere: function(objectWhere, arrValue) {
				var where = '';
				for (var item in objectWhere) {
					where += item + ' = ? and ';
					arrValue.push(objectWhere[item]);
				};
				where = where.substr(0, where.length - 4);
				return where;
			},
			openDb: function() {
				var q = $q.defer();
				if (window.openDatabase) {
					db = openDatabase('fibonaciDb', '1.0', 'Offline local storage', 10 * 1024 * 1024);
					q.resolve(db);
				} else {
					q.reject("system is not support web sql");
				}
				return q.promise;
			},
			createTable: function(db, tableName, arrayColumn) {
				var q = $q.defer();
				var col = arrayColumn[0];
				for (var i = 1; i < arrayColumn.length; i++) {
					col += ', ' + arrayColumn[i];
				}
				db.transaction(function(tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + col + ' )', [], function(tx, success) {
						q.resolve(success);
					}, function(tx, err) {
						console.log(tableName);
						console.log(err);
						q.reject(err);
					});
				});
				return q.promise;
			},
			insertData: function(db, table, arrayColumn, arrayValue) {
				for (var i = arrayValue.length - 1; i >= 0; i--) {
					if (arrayValue[i] !== true && arrayValue[i] !== false && arrayValue[i] !== null) {
						arrayValue[i] = arrayValue[i].toString();
					}
				}
				var q = $q.defer();
				var col = arrayColumn[0],
					val = '?';
				for (var i = 1; i < arrayColumn.length; i++) {
					col += ', ' + arrayColumn[i];
					val += ', ?';
				}
				var sql = 'INSERT INTO ' + table + ' (' + col + ') VALUES (' + val + ')';
				db.transaction(function(tx) {
					tx.executeSql(sql, arrayValue, function(t, result) {
						q.resolve(result);
					}, function(t, err) {
						q.reject(err);
					});
				});
				return q.promise;
			},
			updateData: function(db, sql, object, objectWhere) {
				for (var item in object) {
					if (object[item] !== true && object[item] !== false && object[item] !== null) {
						object[item] = object[item].toString();
					}
				};
				for (var item in objectWhere) {
					if (objectWhere[item] !== true && objectWhere[item] !== false && objectWhere[item] !== null) {
						objectWhere[item] = objectWhere[item].toString();
					}
				};
				var arrValue = [],
					objectValue = '',
					where = '';
				for (var item in object) {
					objectValue += item + ' = ?, ';
					arrValue.push(object[item]);
				};
				objectValue = objectValue.substr(0, objectValue.length - 2);
				sql = sql.replace('objectValue', objectValue);
				where = this.getwhereFromObjectWhere(objectWhere, arrValue);
				sql += where;
				var q = $q.defer();
				db.transaction(function(t) {
					t.executeSql(sql, arrValue, function(t, result) {
						q.resolve(result);
					}, function(t, err) {
						q.reject(err);
					});
				});
				return q.promise;
			},
			deleteData: function(db, sql, objectWhere) {
				for (var item in objectWhere) {
					if (objectWhere[item] !== true && objectWhere[item] !== false && objectWhere[item] !== null) {
						objectWhere[item] = objectWhere[item].toString();
					}
				};
				var arrValue = [],
					where = '';
				where = this.getwhereFromObjectWhere(objectWhere, arrValue);
				sql += where;
				var q = $q.defer();
				db.transaction(function(t) {
					t.executeSql(sql, arrValue, function(t, result) {
						q.resolve(result);
					}, function(t, err) {
						q.reject(err);
					});
				});
				return q.promise;
			},
			dropTable: function(db, sql) {
				var q = $q.defer();
				db.transaction(function(t) {
					t.executeSql(sql, [], function(t, result) {
						q.resolve(result);
					}, function(t, err) {
						q.reject(err);
					});
				});
				return q.promise;
			},
			executeQuery: function(db, sql, objectWhere) {
				for (var item in objectWhere) {
					if (objectWhere[item] !== true && objectWhere[item] !== false && objectWhere[item] !== null) {
						objectWhere[item] = objectWhere[item].toString();
					}
				};
				var arrValue = [];
				var where = '';
				if (angular.isDefined(objectWhere) && objectWhere !== null) {
					where = this.getwhereFromObjectWhere(objectWhere, arrValue);
				}
				sql += where;
				var q = $q.defer();
				db.transaction(function(t) {
					t.executeSql(sql, arrValue, function(t, result) {
						q.resolve(result);
					}, function(t, err) {
						// couldn't read database
						console.log(sql);
						console.log(err);
						q.reject(err);
					});
				});
				return q.promise;
			},
			importData: function(db, arrSql, arrValue) {
				var q = $q.defer();
				db.transaction(function(t) {
					arrSql.forEach(function(item, index) {
						for (var i = arrValue[index].length - 1; i >= 0; i--) {
							if (arrValue[index][i] !== true && arrValue[index][i] !== false && arrValue[index][i] !== null) {
								arrValue[index][i] = arrValue[index][i].toString();
							}
						}
						t.executeSql(item, arrValue[index], function(t, result) {
							if (index === arrSql.length - 1) {
								q.resolve(result);
							}
						}, function(t, err) {
							if (index === arrSql.length - 1) {
								q.reject(err);
							}
						});
					});
				});
				return q.promise;
			},
			selectWords: function(db, arrWhere, state, $commonModel) {
				var arrResult = [];
				var q = $q.defer();
				db.transaction(function(t) {
					var sql = 'select * from Words where idOffline = ?' + ' and createdBy = ?';
					if (angular.isDefined(state)) {
						sql += " and isLearned = ?";
					}
					arrWhere.forEach(function(item, index) {
						for (var i = item.length - 1; i >= 0; i--) {
							if (item[i] !== true && item[i] !== false && item[i] !== null) {
								item[i] = item[i].toString();
							}
						}
						item.push($commonModel.currentUser.idOnline.toString());
						if (angular.isDefined(state)) {
							item.push('0');
						}
						t.executeSql(sql, item, function(t, result) {
							if (result.rows.length > 0) {
								arrResult.push(result.rows[0]);
							}
							if (index === arrWhere.length - 1) {
								q.resolve(arrResult);
							}
						}, function(t, err) {
							if (index === arrWhere.length - 1) {
								q.reject(err);
							}
						});
					});
				});
				return q.promise;
			},
		};
		return model;
	}]);
})();