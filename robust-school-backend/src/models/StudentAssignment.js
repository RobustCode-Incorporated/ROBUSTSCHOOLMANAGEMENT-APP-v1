const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');
const Classroom = require('./Classroom');

const StudentAssignment = sequelize.define('StudentAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
}, {
  tableName: 'student_assignments'
});

// Relations
StudentAssignment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
StudentAssignment.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });

module.exports = StudentAssignment;