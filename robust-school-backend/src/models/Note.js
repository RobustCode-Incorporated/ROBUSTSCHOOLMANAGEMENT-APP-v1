const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');
const Subject = require('./Subject');
const Classroom = require('./Classroom');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 20
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'notes'
});

// Associations
Note.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Note.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });
Note.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Note.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });

module.exports = Note;