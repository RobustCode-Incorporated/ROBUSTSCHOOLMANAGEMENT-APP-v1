const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./User');
const Classroom = require('./Classroom');
const Subject = require('./Subject');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'documents'
});

Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });
Document.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

module.exports = Document;