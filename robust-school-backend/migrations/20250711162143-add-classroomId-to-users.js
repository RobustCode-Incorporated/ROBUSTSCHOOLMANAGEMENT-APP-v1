'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Users' AND column_name='classroomId'
        ) THEN
          ALTER TABLE "Users" ADD COLUMN "classroomId" UUID REFERENCES "classrooms"(id) ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'classroomId');
  }
};