angular.module('commonDTA', ['commonModule']);
angular.module('commonDTA', []).factory('$DTA', ['$q', '$commonSql', function($q, $commonSql) {
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
			$commonSql.createTable(db, 'lessons', ['id NOT NULL', 'name', 'state', 'learnStartDate', 'relearnDate', 'nextLearnDate', 'nextFibonaci', 'isLearned', 'countLearn', 'CONSTRAINT pk_lessons PRIMARY KEY (id)', 'CONSTRAINT fk_lessons FOREIGN KEY (id) REFERENCES classes_lessons(lessonId) ON DELETE CASCADE']);
			$commonSql.createTable(db, 'classes', ['userId', 'id NOT NULL', 'name', 'CONSTRAINT pk_classes PRIMARY KEY (id)']);
			$commonSql.createTable(db, 'words', ['id NOT NULL', 'english', 'vietnamese', 'isLearned', 'CONSTRAINT pk_words PRIMARY KEY (id)', 'CONSTRAINT fk_words FOREIGN KEY (id) REFERENCES classes_words(wordId) ON DELETE CASCADE']);
			$commonSql.createTable(db, 'classes_words', ['classId NOT NULL', 'wordId NOT NULL', 'CONSTRAINT pk_words PRIMARY KEY (classId, wordId)', 'CONSTRAINT fk_classes_words FOREIGN KEY (classId) REFERENCES classes(id)  ON DELETE CASCADE']);
			$commonSql.createTable(db, 'classes_lessons', ['classId NOT NULL', 'lessonId NOT NULL', 'CONSTRAINT pk_classes_lessons PRIMARY KEY (classId, lessonId)', 'CONSTRAINT fk_classes_lessons FOREIGN KEY (classId) REFERENCES classes(id)  ON DELETE CASCADE']);
			$commonSql.createTable(db, 'lessons_words', ['lessonId NOT NULL', 'wordId NOT NULL']);
			$commonSql.createTable(db, 'config', ['name NOT NULL', 'value NOT NULL']);
			$commonSql.createTable(db, 'fibonacci', ['number NOT NULL']);
			$commonSql.createTable(db, 'users', ['uid NOT NULL', 'id NOT NULL', 'username', 'password', 'email', 'CONSTRAINT pk_users PRIMARY KEY (uid, id)']);
			// 1) delete_classes before
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes before delete on classes begin 	delete from classes_lessons where classId = OLD.id; 	delete from classes_words where classId = OLD.id; end');
			// 2) delete_classes_lessons before
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes_lessons before delete on classes_lessons begin 	delete from lessons where id = OLD.lessonId; end');
			// 3) delete_classes_words before
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_classes_words before delete on classes_words begin 	delete from words where id = OLD.wordId; 	delete from lessons_words where wordId = OLD.wordId; end');
			// 4) delete_lessons before
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_lessons before delete on lessons begin 	delete from lessons_words where lessonId = OLD.id; end');
			// 5) insert_lessons_words after
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS insert_lessons_words after insert on lessons_words begin 	update words set isLearned = 1 where id = NEW.wordId; end');
			// 6) delete_lessons_words before
			$commonSql.executeQuery(db, 'create trigger IF NOT EXISTS delete_lessons_words before delete on lessons_words begin 	update words set isLearned = 0 where id = OLD.wordId; end');
			var sql = "ALTER TABLE words ADD example";
			$commonSql.executeQuery(db, sql);
		},
		getNextIdOfTable: function(db, tableName) {
			var sql = "select id from " + tableName + " ORDER BY id DESC LIMIT 1";
			var q = $q.defer();
			$commonSql.executeQuery(db, sql).then(function(result) {
				if (result.rows.length == 0) {
					q.resolve(0);
				} else {
					q.resolve(result.rows[0].id + 1);
				}
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		},
		insertDataToTable: function(db, tableName, object) {
			var objectArr = this.getArrayFromObject(object);
			var q = $q.defer();
			$commonSql.insertData(db, tableName, objectArr.arrColumn, objectArr.arrValue).then(function(result) {
				q.resolve(result);
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		},
		//Class
		selectTableById: function(db, tableName, id) {
			var sql = 'select * from ' + tableName + ' where id = ' + id;
			var q = $q.defer();
			$commonSql.executeQuery(db, sql).then(function(result) {
				q.resolve(result);
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		},
		selectTableWhere: function(db, tableName, objectWhere) {
			var sql = 'select * from ' + tableName + ' where ';
			var q = $q.defer();
			$commonSql.executeQuery(db, sql, objectWhere).then(function(result) {
				q.resolve(result);
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		},
		selectTableAll: function(db, tableName) {
			var sql = 'select * from ' + tableName;
			var q = $q.defer();
			$commonSql.executeQuery(db, sql).then(function(result) {
				q.resolve(result);
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		},
		updateTable: function(db, tableName, object, objectWhere) {
			var sql = 'update ' + tableName + ' set objectValue where ';
			var q = $q.defer();
			$commonSql.updateData(db, sql, object, objectWhere).then(function(result) {
				q.resolve(result);
			}, function(err) {
				console.log(err);
				q.reject(err);
			});
			return q.promise;
		},
		deleteTable: function(db, tableName, objectWhere) {
			var sql = 'delete from ' + tableName + ' where ';
			var q = $q.defer();
			$commonSql.deleteData(db, sql, objectWhere).then(function(result) {
				q.resolve(result);
			}, function(err) {
				console.log(err);
				q.reject(err);
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
			var q = $q.defer();
			this.arrSql.push('INSERT INTO classes_words (classId, wordId) values (?, ?)');
			this.arrSql.push('INSERT INTO words (id, english, vietnamese, example, isLearned) values (?, ?, ?, ?, ?)');
			var arrChildValue = [];
			for (var item in itemClasses_Words) {
				arrChildValue.push(itemClasses_Words[item]);
			};
			this.arrValue.push(arrChildValue);
			arrChildValue = [];
			for (var item in itemWords) {
				arrChildValue.push(itemWords[item]);
			};
			this.arrValue.push(arrChildValue);
			if (n === length - 1) {
				$commonSql.importData(db, this.arrSql, this.arrValue).then(function(result) {
					q.resolve(result);
				}, function(err) {
					console.log(err);
					q.reject(err);
				});
				this.arrValue = [];
				this.arrSql = [];
			}
			return q.promise;
		},
		selectAllWordsOfClasses: function(db, arrWhere, state) {
			var q = $q.defer();
			$commonSql.selectWords(db, arrWhere, state).then(function(result) {
				q.resolve(result);
			}, function(err) {
				q.reject(err);
			});
			return q.promise;
		}
	};
	return model;
}]);