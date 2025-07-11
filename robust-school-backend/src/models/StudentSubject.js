const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');
const Subject = require('./Subject');

const StudentSubject = sequelize.define('StudentSubject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
}, {
  tableName: 'student_subjects'
});

// Associations
User.belongsToMany(Subject, {
  through: StudentSubject,
  foreignKey: 'studentId',
  as: 'enrolledSubjects'
});

Subject.belongsToMany(User, {
  through: StudentSubject,
  foreignKey: 'subjectId',
  as: 'students'
});

module.exports = StudentSubject;