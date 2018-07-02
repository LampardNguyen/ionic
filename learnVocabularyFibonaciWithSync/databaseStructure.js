users = [{
	uid: null,
	id: null,
	username: null,
	password: null,
	email: null,
}]
lessons = [{
	id: 1,
	name: '50 từ đầu tiên',
	state: 0, //0 not leant yet, 1 learned, 2 exercise
	vocabulary: [{
		id: 0
	}],
	learnStartDate: '2015-08-06',
	relearnDate: null,
	nextLearnDate: '2015-08-07',
	nextFibonaci: '2',
	isLearned: 1,
	countLearn: 0
}];
classes = [{
	id: 1,
	name: 'từ vựng toiec',
	vocabulary: [{
		id: 0
	}],
	lessons: [{
		id: 1
	}]
}];
words = [{
	id: 0,
	english: 'hello',
	vietnamese: 'xin chao',
	isLearned: 0
}];
classes_words = [{
	classId: 1,
	wordId: 0
}];
classes_lessons = [{
	classId: 1,
	lessonId: 1
}];
lessons_words = [{
	lessonId: 1,
	wordId: 0
}];
config = [{
	id: 0,
	maxLearn: 22,
	localLanguage: 'english'
}];
fibonacci = [{
		number: 1
	}, {
		number: 2
	}]
	[1, 2, 3, 5, 8, 13]
	[1, 1, 2, 3, 5, 8]
nextDate = ((nextFibo - currentFibo) * day) + relearnDate;