const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');
const Classroom = require('./Classroom');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Exemple : MATH101
  },
  coefficient: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'subjects'
});

Subject.belongsTo(User, { as: 'professor', foreignKey: 'professorId' });
Subject.belongsTo(Classroom, { as: 'classroom', foreignKey: 'classroomId' });

module.exports = Subject;