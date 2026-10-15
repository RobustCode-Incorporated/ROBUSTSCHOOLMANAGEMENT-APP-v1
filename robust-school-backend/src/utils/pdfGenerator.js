const PDFDocument = require('pdfkit');

function generateBulletinPDF(student, classroom, notes) {
  const doc = new PDFDocument({ margin: 50 });

  // Buffer pour collecter les données PDF
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Titre
    doc.fontSize(20).text('Bulletin de notes', { align: 'center' });
    doc.moveDown();

    // Infos élève
    doc.fontSize(14).text(`Nom : ${student.lastName} ${student.firstName}`);
    doc.text(`Classe : ${classroom.name} (${classroom.level})`);
    doc.moveDown();

    // Table des notes
    doc.fontSize(16).text('Notes:', { underline: true });
    doc.moveDown(0.5);

    // Entête
    doc.fontSize(12).text('Matière', 50, doc.y, { continued: true });
    doc.text('Note', 300, doc.y);
    doc.moveDown(0.5);

    let sum = 0;
    let count = 0;
    notes.forEach(note => {
      doc.text(note.subject?.name || 'Matière supprimée', 50, doc.y, { continued: true });
      doc.text(note.value.toFixed(2), 300, doc.y);
      sum += note.value;
      count++;
      doc.moveDown(0.2);
    });

    const average = count > 0 ? (sum / count).toFixed(2) : 'N/A';
    doc.moveDown();
    doc.fontSize(14).text(`Moyenne générale : ${average}`, { align: 'right' });

    doc.end();
  });
}

module.exports = { generateBulletinPDF };