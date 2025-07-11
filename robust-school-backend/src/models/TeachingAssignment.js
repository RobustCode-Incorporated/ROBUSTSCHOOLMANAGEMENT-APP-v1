const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const TeachingAssignment = sequelize.define('TeachingAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  professorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  classroomId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  tableName: 'teaching_assignments',
  indexes: [
    { unique: true, fields: ['professorId', 'subjectId', 'classroomId'] }
  ]
});

// ✅ Associations intégrées via .associate()
TeachingAssignment.associate = (models) => {
  TeachingAssignment.belongsTo(models.Subject, {
    foreignKey: 'subjectId',
    as: 'assignedSubject'
  });

  TeachingAssignment.belongsTo(models.User, {
    foreignKey: 'professorId',
    as: 'assignedProfessor'
  });

  TeachingAssignment.belongsTo(models.Classroom, {
    foreignKey: 'classroomId',
    as: 'assignedClassroom'
  });
};

module.exports = TeachingAssignment;