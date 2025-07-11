import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfNotesScreen extends StatefulWidget {
  const ProfNotesScreen({super.key});

  @override
  State<ProfNotesScreen> createState() => _ProfNotesScreenState();
}

class _ProfNotesScreenState extends State<ProfNotesScreen> {
  List<dynamic> enrolled = [];
  List<dynamic> notes = [];
  List<dynamic> subjects = [];

  String? selectedSubjectId;
  String? selectedStudentId;
  double? noteValue;
  String comment = '';
  DateTime? selectedDate;
  bool editMode = false;
  String? noteIdToEdit;

  String? error;
  String? success;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  List<dynamic> get filteredStudents {
    if (selectedSubjectId == null) return [];
    return enrolled
        .where((e) => e['subject']['id'].toString() == selectedSubjectId)
        .toList();
  }

  String getStudentName(String id) {
    final student = enrolled.firstWhere(
        (e) => e['student']['id'].toString() == id,
        orElse: () => null);
    if (student != null) {
      return '${student['student']['firstName']} ${student['student']['lastName']}';
    }
    return 'Inconnu';
  }

  String getSubjectName(String id) {
    final subject = subjects.firstWhere(
        (s) => s['id'].toString() == id,
        orElse: () => null);
    return subject != null ? subject['name'] : 'Inconnu';
  }

  String formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> fetchData() async {
    try {
      final enrolledRes =
          await ApiService.get('/subjects/professor/enrolled-students');
      final notesRes = await ApiService.get('/notes/professeur');

      setState(() {
        enrolled = enrolledRes ?? [];
        notes = notesRes ?? [];

        final unique = <String, dynamic>{};
        for (var e in enrolled) {
          unique[e['subject']['id'].toString()] = e['subject'];
        }
        subjects = unique.values.toList();
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors du chargement des données.';
      });
    }
  }

  void resetForm() {
    setState(() {
      selectedSubjectId = null;
      selectedStudentId = null;
      noteValue = null;
      comment = '';
      selectedDate = null;
      editMode = false;
      noteIdToEdit = null;
      success = null;
      error = null;
    });
  }

  Future<void> handleSubmit() async {
    if (selectedSubjectId == null ||
        selectedStudentId == null ||
        noteValue == null ||
        selectedDate == null) {
      setState(() {
        error = 'Tous les champs obligatoires doivent être remplis.';
        success = null;
      });
      return;
    }

    final payload = {
      'studentId': selectedStudentId,
      'subjectId': selectedSubjectId,
      'value': noteValue,
      'comment': comment,
      'date': selectedDate!.toIso8601String(),
    };

    try {
      if (editMode) {
        await ApiService.put('/notes/$noteIdToEdit', payload);
        setState(() => success = 'Note mise à jour.');
      } else {
        await ApiService.post('/notes', payload);
        setState(() => success = 'Note enregistrée.');
      }
      resetForm();
      await fetchData();
    } catch (e) {
      setState(() {
        error = e.toString().replaceAll('Exception: ', '');
        success = null;
      });
    }
  }

  void startEdit(Map<String, dynamic> note) {
    setState(() {
      editMode = true;
      noteIdToEdit = note['id'].toString();
      selectedSubjectId = note['subjectId'].toString();
      selectedStudentId = note['studentId'].toString();
      noteValue = double.tryParse(note['value'].toString());
      comment = note['comment'] ?? '';
      selectedDate = DateTime.tryParse(note['date']);
    });
  }

  Future<void> confirmDelete(String id) async {
    final confirmed = await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Confirmation'),
        content: const Text('Voulez-vous vraiment supprimer cette note ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Supprimer')),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.delete('/notes/$id');
        await fetchData();
      } catch (_) {
        setState(() => error = 'Erreur lors de la suppression.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion des notes'),
        backgroundColor: const Color(0xFF0E2C5A),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            const Text(
              'Ajouter / Modifier une note',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0E2C5A)),
            ),
            const SizedBox(height: 12),

            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Matière enseignée', border: OutlineInputBorder()),
              value: selectedSubjectId,
              items: subjects.map((s) {
                return DropdownMenuItem(value: s['id'].toString(), child: Text(s['name']));
              }).toList(),
              onChanged: (val) => setState(() => selectedSubjectId = val),
            ),
            const SizedBox(height: 10),

            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Élève inscrit', border: OutlineInputBorder()),
              value: selectedStudentId,
              items: filteredStudents.map((s) {
                final student = s['student'];
                return DropdownMenuItem(
                  value: student['id'].toString(),
                  child: Text('${student['firstName']} ${student['lastName']}'),
                );
              }).toList(),
              onChanged: (val) => setState(() => selectedStudentId = val),
            ),
            const SizedBox(height: 10),

            TextFormField(
              decoration: const InputDecoration(labelText: 'Note (sur 20)', border: OutlineInputBorder()),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              initialValue: noteValue?.toString() ?? '',
              onChanged: (val) => noteValue = double.tryParse(val),
            ),
            const SizedBox(height: 10),

            TextFormField(
              decoration: const InputDecoration(labelText: 'Commentaire (optionnel)', border: OutlineInputBorder()),
              initialValue: comment,
              onChanged: (val) => comment = val,
            ),
            const SizedBox(height: 10),

            TextFormField(
              readOnly: true,
              decoration: const InputDecoration(labelText: 'Date', border: OutlineInputBorder()),
              controller: TextEditingController(
                text: selectedDate != null ? formatDate(selectedDate!) : '',
              ),
              onTap: () async {
                final pickedDate = await showDatePicker(
                  context: context,
                  initialDate: selectedDate ?? DateTime.now(),
                  firstDate: DateTime(2000),
                  lastDate: DateTime(2100),
                );
                if (pickedDate != null) {
                  setState(() => selectedDate = pickedDate);
                }
              },
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0E2C5A)),
                  onPressed: handleSubmit,
                  child: Text(editMode ? 'Mettre à jour' : 'Ajouter la note'),
                ),
                const SizedBox(width: 10),
                if (editMode)
                  TextButton(
                    onPressed: resetForm,
                    child: const Text('Annuler'),
                  ),
              ],
            ),

            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(error!, style: const TextStyle(color: Colors.red)),
              ),
            if (success != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(success!, style: const TextStyle(color: Colors.green)),
              ),

            const Divider(height: 40),
            const Text(
              'Notes existantes',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0E2C5A)),
            ),
            const SizedBox(height: 12),

            ...notes.map((note) {
              final studentName = getStudentName(note['studentId'].toString());
              final subjectName = getSubjectName(note['subjectId'].toString());
              final value = note['value'];
              final comment = note['comment'] ?? '-';
              final formattedDate = formatDate(DateTime.parse(note['date']));

              return Card(
                margin: const EdgeInsets.symmetric(vertical: 6),
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                child: ListTile(
                  title: Text('$studentName - $subjectName'),
                  subtitle: Text('Note : $value\nCommentaire : $comment\nDate : $formattedDate'),
                  trailing: Wrap(
                    spacing: 8,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, color: Colors.blue),
                        onPressed: () => startEdit(note),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => confirmDelete(note['id'].toString()),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}