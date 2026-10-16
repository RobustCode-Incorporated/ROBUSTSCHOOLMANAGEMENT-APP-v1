const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'prof', 'eleve'),
    allowNull: false
  },
  classroomId: { // ← ✅ nouvelle colonne
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'classrooms', // nom exact de la table
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  archivedAt: { // archivage au lieu de suppression quand il existe des notes
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Association (sera utilisée dans models/index.js)
User.associate = (models) => {
  User.belongsTo(models.Classroom, {
    foreignKey: 'classroomId',
    as: 'classroom'
  });
};

module.exports = User;