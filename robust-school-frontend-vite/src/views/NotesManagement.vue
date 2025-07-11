<template>
  <div class="subjects-wrapper">
    <!-- En-tête détachée -->
    <div class="header-top">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Contenu -->
    <div class="notes-management">
      <!-- Filtres -->
      <div class="filters">
        <input v-model="search.nom" placeholder="Rechercher par élève" />
        <input v-model="search.classe" placeholder="Rechercher par classe" />
        <input v-model="search.matiere" placeholder="Rechercher par matière" />
        <button class="btn-export" @click="exportPDF">📤 Exporter en PDF</button>
      </div>

      <!-- Tableau -->
      <table class="styled-table">
        <thead>
          <tr>
            <th>Élève</th>
            <th>Classe</th>
            <th>Matière</th>
            <th>Note</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="note in filteredNotes" :key="note.id">
            <td>{{ note.eleve?.firstName }} {{ note.eleve?.lastName }}</td>
            <td>{{ formatClass(note.classroom) }}</td>
            <td>{{ note.subject?.name || '-' }}</td>
            <td>{{ note.value }}</td>
            <td>{{ formatDate(note.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from '../assets/logo_black.png'

export default {
  name: 'NotesManagement',
  data() {
    return {
      notes: [],
      error: null,
      search: {
        nom: '',
        classe: '',
        matiere: ''
      }
    }
  },
  computed: {
    filteredNotes() {
      return this.notes.filter(note => {
        const fullName = `${note.eleve?.firstName} ${note.eleve?.lastName}`.toLowerCase()
        const classe = this.formatClass(note.classroom).toLowerCase()
        const matiere = note.subject?.name?.toLowerCase() || ''
        return (
          fullName.includes(this.search.nom.toLowerCase()) &&
          classe.includes(this.search.classe.toLowerCase()) &&
          matiere.includes(this.search.matiere.toLowerCase())
        )
      })
    }
  },
  methods: {
    async fetchNotes() {
      try {
        const res = await api.get('/notes/all')
        this.notes = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des notes.'
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    formatClass(classroom) {
      return classroom ? `${classroom.name} - ${classroom.level}` : '-'
    },
    getAcademicYear() {
      const now = new Date()
      const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
      return `${year}-${year + 1}`
    },
    async exportPDF() {
      const doc = new jsPDF()
      const date = new Date().toLocaleDateString()
      const academicYear = this.getAcademicYear()

      const img = new Image()
      img.src = logo

      img.onload = () => {
        // Filigrane (logo centré et à 10% d'opacité)
doc.setGState(new doc.GState({ opacity: 0.1 })) // opacité à 10%
doc.addImage(img, 'PNG', 50, 80, 100, 100)
doc.setGState(new doc.GState({ opacity: 1 }))   // rétablir l’opacité normale

        // Logo en haut
        doc.addImage(img, 'PNG', 10, 10, 30, 30)
        doc.setFontSize(16)
        doc.text('ROBUST SCHOOL MANAGEMENT SYSTEM', 45, 20)
        doc.setFontSize(12)
        doc.text(`Relevé de notes - ${date}`, 45, 28)
        doc.text(`Année scolaire : ${academicYear}`, 45, 34)

        const filtered = this.filteredNotes
        const uniqueEleves = new Set(filtered.map(n => n.eleve?.id))
        const isIndividuel = uniqueEleves.size === 1

        let startY = 45

        if (isIndividuel) {
          const eleve = filtered[0].eleve
          const classe = this.formatClass(filtered[0].classroom)

          doc.setFontSize(11)
          doc.text(`Nom de l'élève : ${eleve?.firstName || ''} ${eleve?.lastName || ''}`, 10, startY + 10)
          doc.text(`Classe : ${classe}`, 10, startY + 17)
          startY += 25
        }

        const rows = filtered.map(note => [
          `${note.eleve?.firstName || ''} ${note.eleve?.lastName || ''}`,
          this.formatClass(note.classroom),
          note.subject?.name || '-',
          note.value,
          this.formatDate(note.createdAt)
        ])

        autoTable(doc, {
          head: [['Élève', 'Classe', 'Matière', 'Note', 'Date']],
          body: rows,
          startY: startY,
          styles: { fontSize: 10 }
        })

        const pageHeight = doc.internal.pageSize.height
        doc.setFontSize(9)
        doc.setTextColor(50)
        doc.text('Document généré automatiquement par Robust School', 10, pageHeight - 15)
        doc.text('Signature Administration : _______________________', 10, pageHeight - 8)

        const fileName = isIndividuel
          ? `releve_${filtered[0].eleve?.firstName}_${filtered[0].eleve?.lastName}.pdf`
          : 'releve_notes.pdf'

        doc.save(fileName)
      }
    }
  },
  mounted() {
    this.fetchNotes()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.notes-management {
  max-width: 1000px;
  margin: auto;
  padding: 2rem 1rem;
  font-family: 'ABeeZee', sans-serif;
}

.header {
  background-color: #f5f5f5;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
}

.header .logo {
  width: 50px;
}

.header h1 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.4rem;
  margin: 0;
  color: #0e2c5a;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filters input {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  flex: 1;
  min-width: 200px;
}

.btn-export {
  background-color: #104b71;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}

.btn-export:hover {
  background-color: #0e2c5a;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;
  box-shadow: 0 0 5px rgba(0,0,0,0.05);
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
}

.styled-table th, .styled-table td {
  padding: 0.75rem;
  text-align: center;
  border: 1px solid #ddd;
}

.styled-table tbody tr:hover {
  background-color: #f9f9f9;
}

.error {
  color: red;
  margin-top: 1rem;
}

.subjects-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fdfdfd;
}

/* Nouvelle barre supérieure */
.header-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #0e2c5a;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 3px solid #104b71;
}

.header-top .logo {
  width: 50px;
  height: auto;
}

.header-top h1 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.4rem;
  margin: 0;
}
</style>