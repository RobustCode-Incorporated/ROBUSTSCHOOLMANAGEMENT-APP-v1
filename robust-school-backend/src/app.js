const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const sequelize = require('./database/sequelize');

const app = express();

// i18n setup
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'fr',
    preload: ['fr', 'en'],
    backend: {
      loadPath: __dirname + '/translations/{{lng}}.json'
    }
  });

app.use(i18nextMiddleware.handle(i18next));

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Route test basique
app.get('/', (req, res) => {
  res.send(req.t('welcome'));
});

// Synchronisation DB
sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ Base de données synchronisée avec succès !");
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion DB :", err);
  });

// Import des routes
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const teachingAssignmentRoutes = require('./routes/teachingAssignmentRoutes');
const studentAssignmentRoutes = require('./routes/studentAssignmentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const documentRoutes = require('./routes/documentRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const studentSubjectRoutes = require('./routes/studentSubjectRoutes');
const adminRoutes = require('./routes/adminRoutes');  // <-- Ajout adminRoutes

// Montée des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teaching-assignments', teachingAssignmentRoutes);
app.use('/api/student-assignments', studentAssignmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/student-subjects', studentSubjectRoutes);
app.use('/api/admin', adminRoutes);  // <-- Nouveau endpoint admin

// Middleware 404 (routes non trouvées)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware gestion d’erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Démarrage serveur
const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});