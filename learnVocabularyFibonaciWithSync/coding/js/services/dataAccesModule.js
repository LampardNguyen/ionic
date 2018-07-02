(function() {
	angular.module('commonDTA', ['commonModule', 'modelModule']);
	angular.module('commonDTA', []).factory('$DTA', ['$q', '$commonSql', '$timeout', '$tableName', '$commonModel', function($q, $commonSql, $timeout, $tableName, $commonModel) {
		var model = {
			arrValue: [],
			arrSql: [],
			getArrayFromObject: function(object) {
				var arrColumn = [];
				var arrValue = [];
				for (var item in object) {
					arrColumn.push(item);
					arrValue.push(object[item]);
				};
				return {
					arrColumn: arrColumn,
					arrValue: arrValue
				};
			},
			createTableNeeded: function(db) {
				$commonSql.createTable(db, 'Lessons', ['idOffline NOT NULL', 'name', 'state', 'learnStartDate', 'relearnDate', 'nextLearnDate', 'nextFibonaci', 'isLearned', 'countLearn', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline', 'CONSTRAINT pk_lessons PRIMARY KEY (idOffline)', 'CONSTRAINT fk_lessons FOREIGN KEY (idOffline) REFERENCES ClassesLessons(lessonId) ON DELETE CASCADE']);
				$commonSql.createTable(db, 'Classes', ['userId', 'idOffline NOT NULL', 'name', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline', 'idLanguage', 'CONSTRAINT pk_classes PRIMARY KEY (idOffline)']);
				$commonSql.createTable(db, 'Words', ['idOffline NOT NULL', 'english', 'vietnamese', 'isLearned', 'example', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline', 'CONSTRAINT pk_words PRIMARY KEY (idOffline)', 'CONSTRAINT fk_words FOREIGN KEY (idOffline) REFERENCES ClassesWords(wordId) ON DELETE CASCADE']);
				$commonSql.createTable(db, 'ClassesWords', ['classId NOT NULL', 'wordId NOT NULL', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline', 'CONSTRAINT pk_words PRIMARY KEY (classId, wordId)', 'CONSTRAINT fk_classes_words FOREIGN KEY (classId) REFERENCES Classes(idOffline)  ON DELETE CASCADE']);
				$commonSql.createTable(db, 'ClassesLessons', ['classId NOT NULL', 'lessonId NOT NULL', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline', 'CONSTRAINT pk_classes_lessons PRIMARY KEY (classId, lessonId)', 'CONSTRAINT fk_classes_lessons FOREIGN KEY (classId) REFERENCES Classes(idOffline)  ON DELETE CASCADE']);
				$commonSql.createTable(db, 'LessonsWords', ['lessonId NOT NULL', 'wordId NOT NULL', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline']);
				$commonSql.createTable(db, 'Configs', ['name NOT NULL', 'value NOT NULL', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline']);
				$commonSql.createTable(db, 'Fibonacci', ['number NOT NULL', 'isSync', 'created', 'updated', 'createdBy', 'deletedBy', 'isDeleted', 'idOnline']);
				$commonSql.createTable(db, 'Users', ['uid NOT NULL', 'idOffline NOT NULL', 'username', 'password', 'email', 'isSync', 'created', 'updated', 'deletedBy', 'isDeleted', 'idOnline', 'CONSTRAINT pk_users PRIMARY KEY (uid, idOffline)']);
				// 1) delete_classes before
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes before delete on Classes begin 	delete from ClassesLessons where classId = OLD.idOffline; 	delete from ClassesWords where classId = OLD.idOffline; end');
				// 2) delete_classes_lessons before
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes_lessons before delete on ClassesLessons begin 	delete from Lessons where idOffline = OLD.lessonId; end');
				// 3) delete_classes_words before
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes_words before delete on ClassesWords begin 	delete from Words where idOffline = OLD.wordId; 	delete from LessonsWords where wordId = OLD.wordId; end');
				// 4) delete_lessons before
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_lessons before delete on Lessons begin 	delete from LessonsWords where lessonId = OLD.idOffline; end');
				// 5) insert_lessons_words after
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS insert_lessons_words after insert on LessonsWords begin 	update Words set isLearned = 1 where idOffline = NEW.wordId; end');
				// 6) delete_lessons_words before
				$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_lessons_words before delete on LessonsWords begin 	update Words set isLearned = 0 where idOffline = OLD.wordId; end');
				// var sql = "drop table Lessons";
				// $commonSql.executeQuery(db, sql);
				// var sql = "drop table Classes";
				// $commonSql.executeQuery(db, sql);
				// var sql = "drop table Words";
				// $commonSql.executeQuery(db, sql);
				// var sql = "drop table ClassesWords";
				// $commonSql.executeQuery(db, sql);
				// var sql = "drop table ClassesLessons";
				// $commonSql.executeQuery(db, sql);
				// var sql = "drop table LessonsWords";
				// $commonSql.executeQuery(db, sql);

			},
			getMaxColOfTable: function(db, tableName, col, type) {
				var sql = "select " + col + " from " + tableName + " ORDER BY " + col + " DESC LIMIT 1";
				var q = $q.defer();
				$commonSql.executeQuery(db, sql).then(function(result) {
					if (result.rows.length == 0) {
						q.resolve(null);
					} else {
						q.resolve(result.rows[0]);
					}
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			getNextIdOfTable: function(db, tableName) {
				var sql = "select idOffline from " + tableName + " ORDER BY CAST(idOffline AS INT) DESC LIMIT 1";
				var q = $q.defer();
				$commonSql.executeQuery(db, sql).then(function(result) {
					if (result.rows.length == 0) {
						q.resolve(0);
					} else {
						q.resolve(Number(result.rows[0].idOffline) + 1);
					}
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			insertTableLocal: function(db, tableName, object, successFn, errorFn) {
				object.created = new Date(object.created).toISOString();
				object.updated = new Date(object.updated).toISOString();
				var objectArr = this.getArrayFromObject(object);
				$commonSql.insertData(db, tableName, objectArr.arrColumn, objectArr.arrValue).then(function(result) {
					(successFn || angular.noop)(result);
				}, function(err) {
					(errorFn || angular.noop)(err);
				});
			},
			insertDataToTable: function(db, tableName, object) {
				var that = this;
				var q = $q.defer();
				if ($commonModel.isSyncToServer != false) {
					if (tableName == 'Users') {
						var userOnline = new Parse.User();
						//parse to string
						for (var item in object) {
							if (object[item] !== true && object[item] !== false && object[item] !== null) {
								object[item] = object[item].toString();
							}
						};
						that.executeParse(userOnline, 'signUp', object).then(function(result) {
							object.idOnline = userOnline.id;
							object.isSync = true;
							object.created = userOnline.createdAt.toISOString();
							object.updated = userOnline.updatedAt.toISOString();
							that.insertTableLocal(db, tableName, object, function(result) {
								q.resolve(result);
							}, function(error) {
								q.reject(error);
							});
						}, function(err) {
							object.isSync = false;
							that.insertTableLocal(db, tableName, object, function(result) {
								q.resolve(result);
							}, function(error) {
								q.reject(error);
							});
						});
					} else {
						if (tableName != $tableName.Fibonacci) {
							object.createdBy = $commonModel.currentUser.idOnline;
						}
						var ObjectParse = Parse.Object.extend(tableName);
						var objectSave = new ObjectParse();
						//parse to string
						for (var item in object) {
							if (object[item] !== true && object[item] !== false && object[item] !== null) {
								object[item] = object[item].toString();
							}
						};
						that.executeParse(objectSave, 'save', object).then(function(objectResult) {
							object.idOnline = objectResult.id;
							object.isSync = true;
							object.created = objectResult.createdAt.toISOString();
							object.updated = objectResult.updatedAt.toISOString();
							that.insertTableLocal(db, tableName, object, function(result) {
								q.resolve(result);
							}, function(error) {
								q.reject(error);
							});
						}, function(err) {
							object.isSync = false;
							that.insertTableLocal(db, tableName, object, function(result) {
								q.resolve(result);
							}, function(error) {
								q.reject(error);
							});
						});
					}
				} else {
					object.isSync = true;
					that.insertTableLocal(db, tableName, object, function(result) {
						q.resolve(result);
					}, function(error) {
						q.reject(error);
					});
					$commonModel.isSyncToServer = true;
				}
				return q.promise;
			},
			//Class
			selectTableById: function(db, tableName, idOffline) {
				var where = {
					idOffline: idOffline
				};
				var sql = 'select * from ' + tableName + ' where ';
				if (tableName != $tableName.Users && tableName != $tableName.Fibonacci) {
					where.createdBy = $commonModel.currentUser.idOnline;
				} else if (angular.isDefined($commonModel.currentUser) && tableName == $tableName.Users) {
					where.idOnline = $commonModel.currentUser.idOnline;
				}
				var q = $q.defer();
				$commonSql.executeQuery(db, sql, where).then(function(result) {
					q.resolve(result);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			selectTableWhere: function(db, tableName, objectWhere) {
				var sql = 'select * from ' + tableName + ' where ';
				if (tableName != $tableName.Users && tableName != $tableName.Fibonacci) {
					objectWhere.createdBy = $commonModel.currentUser.idOnline;
				} else if (angular.isDefined($commonModel.currentUser) && tableName == $tableName.Users) {
					objectWhere.idOnline = $commonModel.currentUser.idOnline;
				}
				var q = $q.defer();
				$commonSql.executeQuery(db, sql, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			selectTableAll: function(db, tableName) {
				var sql = 'select * from ' + tableName + ' where ';
				var objectWhere = {};
				if (tableName != $tableName.Users && tableName != $tableName.Fibonacci) {
					objectWhere.createdBy = $commonModel.currentUser.idOnline;
				} else {
					sql = 'select * from ' + tableName;
				}
				var q = $q.defer();
				$commonSql.executeQuery(db, sql, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			//update table with sync
			updateTable: function(db, tableName, object, objectWhere) {
				var q = $q.defer();
				var that = this;
				if (tableName == $tableName.Users) {
					var currentUser = Parse.User.current();
					for (var item in object) {
						if (object[item] !== true && object[item] !== false && object[item] !== null) {
							object[item] = object[item].toString();
						}
						currentUser.set(item, object[item]);
					};
					currentUser.save().then(function(user) {
						return user.fetch();
					}).then(function(user) {
						console.log('Password changed', user);
						object.isSync = true;
						object.updated = user.get('updatedAt').toISOString();
						that.updateTableLocal(db, tableName, object, objectWhere).then(function(result) {
							q.resolve(result);
						}, function(err) {
							console.log(err);
							q.reject(err);
						});
					}, function(error) {
						console.log('Something went wrong', error);
						object.isSync = false;
						that.updateTableLocal(db, tableName, object, objectWhere).then(function(result) {
							q.resolve(result);
						}, function(err) {
							console.log(err);
							q.reject(err);
						});
					});
				} else {
					that.selectTableWhere(db, tableName, objectWhere).then(function(result) {
						var Objects = Parse.Object.extend(tableName);
						var objects = new Parse.Query(Objects);
						objects.get(result.rows[0].idOnline, {
							success: function(objectResult) {
								for (var item in object) {
									if (object[item] !== true && object[item] !== false && object[item] !== null) {
										object[item] = object[item].toString();
									}
									objectResult.set(item, object[item]);
								};
								objectResult.save(null, {
									success: function(objectRe) {
										object.isSync = true;
										object.updated = objectRe.get('updatedAt').toISOString();
										that.updateTableLocal(db, tableName, object, objectWhere).then(function(result) {
											q.resolve(result);
										}, function(err) {
											console.log(err);
											q.reject(err);
										});
									},
									error: function(model, error) {}
								});
							},
							error: function(objectErr, error) {
								object.isSync = false;
								that.updateTableLocal(db, tableName, object, objectWhere).then(function(result) {
									q.resolve(result);
								}, function(err) {
									console.log(err);
									q.reject(err);
								});
							}
						});
					}, function(err) {});
				}
				return q.promise;
			},
			//update table local
			updateTableLocal: function(db, tableName, object, objectWhere) {
				object.updated = new Date(object.updated).toISOString();
				var sql = 'update ' + tableName + ' set objectValue where ';
				if (tableName != $tableName.Users) {
					objectWhere.createdBy = $commonModel.currentUser.idOnline;
				} else if (angular.isDefined($commonModel.currentUser)) {
					objectWhere.idOnline = $commonModel.currentUser.idOnline;
				}
				var q = $q.defer();
				$commonSql.updateData(db, sql, object, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					console.log(err);
					q.reject(err);
				});
				return q.promise;
			},
			deleteTableLocal: function(model, tableName, objectWhere) {
				var that = this;
				var sql = 'delete from ' + tableName + ' where ';
				var q = $q.defer();
				$commonSql.deleteData(model.db, sql, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					console.log(err);
					q.reject(err);
				});
				return q.promise;
			},
			deleteTable: function(model, tableName, objectWhere) {
				var that = this;
				if (tableName != $tableName.Users) {
					objectWhere.createdBy = $commonModel.currentUser.idOnline;
				} else if (angular.isDefined($commonModel.currentUser)) {
					objectWhere.idOnline = $commonModel.currentUser.idOnline;
				}
				var count = 0;
				var q = $q.defer();
				if (tableName == $tableName.Classes) {
					that.selectTableWhere(model.db, $tableName.ClassesWords, {
						classId: objectWhere.idOffline
					}).then(function(result) {
						count = Math.ceil((result.rows.length / 1000));
					}, function(err) {});
				}
				that.deleteTableLocal(model, tableName, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					console.log(err);
					q.reject(err);
				});
				$timeout(function() {
					that.queryTable = function(type, tableName, where, value, fnCallbackSuccess, fnCallbackErr) {
						var objQuery = Parse.Object.extend(tableName);
						var query = new Parse.Query(objQuery);
						query.equalTo(where, value);
						query.equalTo("createdBy", model.currentUser.idOnline);
						query.limit(1000);
						that.queryParse(query, type).then(function(result) {
							(fnCallbackSuccess || angular.noop)(result);
						}, function(err) {
							(fnCallbackErr || angular.noop)(err);
						});
					};
					if (tableName == $tableName.Classes) {
						that.queryTable('first', $tableName.Classes, 'idOffline', objectWhere.idOffline, function(classObj) {
							that.queryTable('find', $tableName.ClassesLessons, 'classId', classObj.get('idOffline'), function(classLessonObjs) {
								classLessonObjs.forEach(function(itemClassLesson) {
									that.queryTable('first', $tableName.Lessons, 'idOffline', itemClassLesson.get('lessonId'), function(lessonObj) {
										that.queryTable('find', $tableName.LessonsWords, 'lessonId', lessonObj.get('idOffline'), function(lessonWordObjs) {
											Parse.Object.destroyAll(lessonWordObjs);
										}, function(err) {
											console.log(err);
										});
										lessonObj.destroy({});
									}, function(err) {
										console.log(err);
									});
								});
								Parse.Object.destroyAll(classLessonObjs);
							}, function(err) {
								console.log(err);
							});
							that.deleteClassWord = function(count, classObj) {
								if (that.countDeleteClassWord > count) {
									return;
								}
								that.queryTable('find', $tableName.ClassesWords, 'classId', classObj.get('idOffline'), function(classWordObjs) {
									classWordObjs.forEach(function(itemClassWord) {
										that.queryTable('first', $tableName.Words, 'idOffline', itemClassWord.get('wordId'), function(wordObj) {
											wordObj.destroy({});
										}, function(err) {
											console.log(err);
										});
									});
									Parse.Object.destroyAll(classWordObjs);
									that.countDeleteClassWord += 1;
									that.deleteClassWord(count, classObj);
								}, function(err) {
									console.log(err);
								});
							};
							that.countDeleteClassWord = 1;
							that.deleteClassWord(count, classObj);
							classObj.destroy({});
						}, function(err) {
							console.log(err);
						});
					} else if (tableName == $tableName.ClassesLessons) {
						that.queryTable('first', $tableName.Lessons, 'idOffline', objectWhere.lessonId, function(lessonObj) {
							that.queryTable('find', $tableName.LessonsWords, 'lessonId', lessonObj.get('idOffline'), function(lessonWordObjs) {
								lessonWordObjs.forEach(function(itemLessonWord) {
									that.queryTable('first', $tableName.Words, 'idOffline', itemLessonWord.get('wordId'), function(wordObj) {
										wordObj.set('isLearned', 0);
										wordObj.save();
									}, function(err) {
										console.log(err);
									});
								});
								Parse.Object.destroyAll(lessonWordObjs);
							}, function(err) {
								console.log(err);
							});
							lessonObj.destroy({});
						}, function(err) {
							console.log(err);
						});
						that.queryTable('first', $tableName.ClassesLessons, 'lessonId', objectWhere.lessonId, function(classLessonObj) {
							classLessonObj.destroy({});
						}, function(err) {
							console.log(err);
						});
					} else if (tableName == $tableName.ClassesWords) {
						that.queryTable('first', $tableName.ClassesWords, 'wordId', objectWhere.wordId, function(classWordObj) {
							classWordObj.destroy({});
						}, function(err) {
							console.log(err);
						});
						that.queryTable('first', $tableName.Words, 'idOffline', objectWhere.wordId, function(wordObj) {
							wordObj.destroy({});
						}, function(err) {
							console.log(err);
						});
					}
				});
				return q.promise;
			},
			dropTable: function(db, tableName) {
				var sql = 'drop table ' + tableName;
				var q = $q.defer();
				$commonSql.dropTable(db, sql).then(function(result) {
					q.resolve(result);
				}, function(err) {
					console.log(err);
					q.reject(err);
				});
				return q.promise;
			},
			importWordsClasses_words: function(db, itemWords, itemClasses_Words, length, n) {
				itemWords.createdBy = $commonModel.currentUser.idOnline;
				itemClasses_Words.createdBy = $commonModel.currentUser.idOnline;
				var that = this;
				var q = $q.defer();
				that.arrSql.push('INSERT INTO ClassesWords (classId, wordId, isDeleted, deletedBy, createdBy, isSync) values (?, ?, ?, ?, ?, ?)');
				that.arrSql.push('INSERT INTO Words (idOffline, english, vietnamese, example, isLearned, isDeleted, deletedBy, createdBy, isSync) values (?, ?, ?, ?, ?, ?, ?, ?, ?)');
				var arrChildValue = [];
				for (var item in itemClasses_Words) {
					arrChildValue.push(itemClasses_Words[item]);
				};
				that.arrValue.push(arrChildValue);
				arrChildValue = [];
				for (var item in itemWords) {
					arrChildValue.push(itemWords[item]);
				};
				that.arrValue.push(arrChildValue);
				//push item to arr save server-----------------------------------
				if (angular.isUndefined(that.arrWords)) {
					that.arrWords = [];
				}
				var itemWord = angular.copy(itemWords);
				delete itemWord.isSync;
				that.arrWords.push(itemWord);
				if (angular.isUndefined(that.arrClassesWords)) {
					that.arrClassesWords = [];
				}
				var itemClass_Word = angular.copy(itemClasses_Words);
				delete itemClass_Word.isSync;
				that.arrClassesWords.push(itemClass_Word);
				//save to local
				if (n === length - 1) {
					$commonSql.importData(db, that.arrSql, that.arrValue).then(function(result) {
						that.updateWordWhenImport();
						that.updateClassWordWhenImport();
						q.resolve(result);
					}, function(err) {
						console.log(err);
						q.reject(err);
					});
					that.arrValue = [];
					that.arrSql = [];
				}
				return q.promise;
			},
			updateWordWhenImport: function() {
				var that = this;
				var objArr = [];
				that.arrWords.forEach(function(item) {
					//save to serve
					var ObjectParse = Parse.Object.extend($tableName.Words);
					var objectSave = new ObjectParse();
					for (var itemChild in item) {
						if (item[itemChild] !== true && item[itemChild] !== false && item[itemChild] !== null) {
							item[itemChild] = item[itemChild].toString();
						}
						objectSave.set(itemChild, item[itemChild]);
					};
					objArr.push(objectSave);
				});
				that.executeParse(Parse.Object, 'saveAll', objArr).then(function(objectResult) {
					//update to local when import
					var arrSql = [],
						arrValue = [];
					objectResult.forEach(function(itemResult, index) {
						var object = {
							idOnline: itemResult.id,
							isSync: true,
							created: itemResult.createdAt.toISOString(),
							updated: itemResult.updatedAt.toISOString(),
							idOffline: that.arrWords[index].idOffline
						};
						arrSql.push('update ' + $tableName.Words + ' set idOnline = ?, isSync = ?, created = ?, updated = ? where idOffline = ?');
						var arrChildValue = [];
						for (var item in object) {
							arrChildValue.push(object[item]);
						};
						arrValue.push(arrChildValue);
						if (index == objectResult.length - 1) {
							$commonSql.importData(db, arrSql, arrValue);
						}
					});
					that.arrWords = [];
				}, function(err) {
					console.log(err);
				});
			},
			updateClassWordWhenImport: function() {
				var that = this;
				var objArr = [];
				that.arrClassesWords.forEach(function(item) {
					//save to serve
					var ObjectParse = Parse.Object.extend($tableName.ClassesWords);
					var objectSave = new ObjectParse();
					for (var itemChild in item) {
						if (item[itemChild] !== true && item[itemChild] !== false && item[itemChild] !== null) {
							item[itemChild] = item[itemChild].toString();
						}
						objectSave.set(itemChild, item[itemChild]);
					};
					objArr.push(objectSave);
				});
				that.executeParse(Parse.Object, 'saveAll', objArr).then(function(objectResult) {
					//update to local when import
					var arrSql = [],
						arrValue = [];
					objectResult.forEach(function(itemResult, index) {
						var object = {
							idOnline: itemResult.id,
							isSync: true,
							created: itemResult.createdAt.toISOString(),
							updated: itemResult.updatedAt.toISOString(),
							classId: that.arrClassesWords[index].classId,
							wordId: that.arrClassesWords[index].wordId
						};
						arrSql.push('update ' + $tableName.ClassesWords + ' set idOnline = ?, isSync = ?, created = ?, updated = ? where classId = ? and wordId = ?');
						var arrChildValue = [];
						for (var item in object) {
							arrChildValue.push(object[item]);
						};
						arrValue.push(arrChildValue);
						if (index == objectResult.length - 1) {
							$commonSql.importData(db, arrSql, arrValue);
						}
					});
					that.arrClassesWords = [];
				}, function(err) {
					console.log(err);
				});
			},
			selectAllWordsOfClasses: function(db, arrWhere, state) {
				var q = $q.defer();
				$commonSql.selectWords(db, arrWhere, state, $commonModel).then(function(result) {
					q.resolve(result);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			selectLessonsOfClasses: function(db, classId) {
				var objectWhere = {};
				var sql = 'select Les.* from ClassesLessons as CL inner join Lessons as Les on CL.lessonId = Les.idOffline where ';
				objectWhere["CL.classId"] = classId;
				objectWhere["Les.createdBy"] = $commonModel.currentUser.idOnline;
				var q = $q.defer();
				$commonSql.executeQuery(db, sql, objectWhere).then(function(result) {
					q.resolve(result);
				}, function(err) {
					q.reject(err);
				});
				return q.promise;
			},
			//parse
			executeParse: function(object, type, model) {
				var defer = $q.defer();
				object[type](model, {
					success: function(result) {
						defer.resolve(result);
					},
					error: function(resultErr) {
						defer.reject(resultErr);
					}
				});
				return defer.promise;
			},
			queryParse: function(object, type) {
				var defer = $q.defer();
				object[type]({
					success: function(result) {
						defer.resolve(result);
					},
					error: function(error) {
						defer.reject(error);
					}
				});
				return defer.promise;
			}
		};
		return model;
	}]);
})();