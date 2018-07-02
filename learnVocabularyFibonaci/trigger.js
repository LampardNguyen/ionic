// 1)
create trigger IF NOT EXISTS delete_classes 
before delete 
on classes 
begin 
	delete from classes_lessons where classId = OLD.id; 
	delete from classes_words where classId = OLD.id; 
end
// 2)
create trigger IF NOT EXISTS delete_classes_lessons 
before delete 
on classes_lessons 
begin 
	delete from lessons where id = OLD.lessonId; 
end
// 3)
create trigger IF NOT EXISTS delete_classes_words 
before delete 
on classes_words 
begin 
	delete from words where id = OLD.wordId; 
	delete from lessons_words where wordId = OLD.wordId; 
end
// 4)
create trigger IF NOT EXISTS delete_lessons 
before delete 
on lessons 
begin 
	delete from lessons_words where lessonId = OLD.id; 
end
// 5)
create trigger IF NOT EXISTS insert_lessons_words 
after insert 
on lessons_words 
begin 
	update words set isLearned = 1 where id = NEW.wordId; 
end
// 6)
create trigger IF NOT EXISTS delete_lessons_words 
before delete 
on lessons_words 
begin 
	update words set isLearned = 0 where id = OLD.wordId; 
end
