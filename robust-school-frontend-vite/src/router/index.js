// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import ProfDashboard from '../views/ProfDashboard.vue'
import EleveDashboard from '../views/EleveDashboard.vue'
import UsersManagement from '../views/UsersManagement.vue'
import ClassroomsManagement from '../views/ClassroomsManagement.vue'
import SubjectsManagement from '../views/SubjectsManagement.vue'
import TimetableManagement from '../views/TimetableManagement.vue'
import DocumentManagement from '../views/DocumentManagement.vue'
import NotesManagement from '../views/NotesManagement.vue'
import TeachingAssignmentsManagement from '../views/TeachingAssignmentsManagement.vue' // <-- Ajout import
import store from '../store'
import ProfNotes from '../views/ProfNotes.vue'  // Ajoute cette ligne en haut avec les autres imports
import EleveNotes from '../views/EleveNotes.vue'
import ProfDocuments from '../views/ProfDocuments.vue'
import ProfTimeTable from '../views/ProfTimeTable.vue'
import EleveSubjects from '../views/EleveSubjects.vue'
import EleveProfile from '../views/EleveProfile.vue'
import EleveDocuments from '../views/EleveDocuments.vue'
import EleveTimetable from '../views/EleveTimetable.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  // Page publique exigée par le Play Store et l'App Store
  { path: '/confidentialite', name: 'PrivacyPolicy', component: PrivacyPolicy },

  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/users', name: 'UsersManagement', component: UsersManagement, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/classrooms', name: 'ClassroomsManagement', component: ClassroomsManagement, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/subjects', name: 'SubjectsManagement', component: SubjectsManagement, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/timetable', name: 'TimetableManagement', component: TimetableManagement, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/documents', name: 'DocumentManagement', component: DocumentManagement, meta: { requiresAuth: true, role: 'ADMIN' } },
  { path: '/admin/notes', name: 'NotesManagement', component: NotesManagement, meta: { requiresAuth: true, role: 'ADMIN' } },

  // Nouvelle route pour TeachingAssignments
  { path: '/admin/teaching-assignments', name: 'TeachingAssignmentsManagement', component: TeachingAssignmentsManagement, meta: { requiresAuth: true, role: 'ADMIN' } },

  { path: '/prof', name: 'ProfDashboard', component: ProfDashboard, meta: { requiresAuth: true, role: 'PROF' } },
  { path: '/prof/notes', name: 'ProfNotes', component: ProfNotes, meta: { requiresAuth: true, role: 'PROF' } },
  { path: '/prof/documents', name: 'ProfDocuments', component: ProfDocuments, meta: { requiresAuth: true, role: 'PROF' } },
  { path: '/prof/timetable', name: 'ProfTimeTable', component: ProfTimeTable, meta: { requiresAuth: true, role: 'PROF' } },

  { path: '/eleve', name: 'EleveDashboard', component: EleveDashboard, meta: { requiresAuth: true, role: 'ELEVE' } },
  { path: '/eleve/notes', name: 'EleveNotes', component: EleveNotes, meta: { requiresAuth: true, role: 'ELEVE' } },
  { path: '/eleve/profile', name: 'EleveProfile', component: EleveProfile, meta: { requiresAuth: true, role: 'ELEVE' } },
  { path: '/eleve/matieres', name: 'EleveSubjects', component: EleveSubjects, meta: { requiresAuth: true, role: 'ELEVE' } },
  // L'inscription aux matières se fait depuis « Mes matières »
  { path: '/eleve/inscription-matieres', redirect: '/eleve/matieres' },
  { path: '/eleve/documents', name: 'EleveDocuments', component: EleveDocuments, meta: { requiresAuth: true, role: 'ELEVE' } },
  { path: '/eleve/timetable', name: 'EleveTimetable', component: EleveTimetable, meta: { requiresAuth: true, role: 'ELEVE' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.userRole?.toUpperCase?.()

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next('/login')
    } else if (to.meta.role && to.meta.role !== userRole) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router