const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  archivedAt: { // archivage au lieu de suppression quand il existe des notes
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'classrooms'
});

module.exports = Classroom;