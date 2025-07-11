const User = require('./User');
const Classroom = require('./Classroom');
const Note = require('./Note');
const Subject = require('./Subject');
const TimetableEntry = require('./TimetableEntry');
const StudentSubject = require('./StudentSubject');
const TeachingAssignment = require('./TeachingAssignment');
const Document = require('./Document');

const db = {
  User,
  Classroom,
  Note,
  Subject,
  TimetableEntry,
  StudentSubject,
  TeachingAssignment,
  Document,
};

// === Associations globales ===

// Élèves et Classes (many-to-many)
User.belongsToMany(Classroom, {
  through: 'StudentAssignments',
  as: 'classrooms',
  foreignKey: 'studentId',
  otherKey: 'classroomId',
});
Classroom.belongsToMany(User, {
  through: 'StudentAssignments',
  as: 'students',
  foreignKey: 'classroomId',
  otherKey: 'studentId',
});

// Notes
Note.belongsTo(User, { as: 'eleve', foreignKey: 'studentId' });
Note.belongsTo(User, { as: 'professeur', foreignKey: 'professorId' });
Note.belongsTo(Subject, { foreignKey: 'subjectId' });
Note.belongsTo(Classroom, { foreignKey: 'classroomId' });

// Emploi du temps
TimetableEntry.belongsTo(User, { foreignKey: 'professorId', as: 'timetableProfessor' });
TimetableEntry.belongsTo(Subject, { foreignKey: 'subjectId', as: 'timetableSubject' });
TimetableEntry.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'timetableClassroom' });
User.hasMany(TimetableEntry, { foreignKey: 'professorId', as: 'timetables' });
Subject.hasMany(TimetableEntry, { foreignKey: 'subjectId', as: 'timetables' });
Classroom.hasMany(TimetableEntry, { foreignKey: 'classroomId', as: 'timetables' });

// Inscriptions élèves aux matières
StudentSubject.belongsTo(Subject, { foreignKey: 'subjectId' });
StudentSubject.belongsTo(User, { foreignKey: 'studentId' });
Subject.hasMany(StudentSubject, { foreignKey: 'subjectId' });
User.hasMany(StudentSubject, { foreignKey: 'studentId' });

// Affectations de cours (matière + prof + classe)



Subject.hasMany(TeachingAssignment, { foreignKey: 'subjectId', as: 'teachingAssignments' });
User.hasMany(TeachingAssignment, { foreignKey: 'professorId', as: 'teachingAssignments' });
Classroom.hasMany(TeachingAssignment, { foreignKey: 'classroomId', as: 'teachingAssignments' });

// Appel automatique des .associate() s’il y en a
Object.values(db).forEach(model => {
  if (model.associate) model.associate(db);
});

module.exports = db;