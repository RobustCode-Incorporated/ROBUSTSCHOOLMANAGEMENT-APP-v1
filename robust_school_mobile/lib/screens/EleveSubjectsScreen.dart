import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EleveSubjectsScreen extends StatefulWidget {
  const EleveSubjectsScreen({super.key});

  @override
  State<EleveSubjectsScreen> createState() => _EleveSubjectsScreenState();
}

class _EleveSubjectsScreenState extends State<EleveSubjectsScreen> {
  List<dynamic> availableSubjects = [];
  List<dynamic> enrolledSubjects = [];
  bool isLoadingAvailable = true;
  bool isLoadingEnrolled = true;
  String? error;
  String? successMessage;

  @override
  void initState() {
    super.initState();
    loadSubjects();
  }

  Future<void> loadSubjects() async {
    setState(() {
      isLoadingAvailable = true;
      isLoadingEnrolled = true;
      error = null;
      successMessage = null;
    });

    try {
      final availableRes = await ApiService.get('/subjects/available');
      final enrolledRes = await ApiService.get('/subjects/enrolled');

      setState(() {
        availableSubjects = availableRes ?? [];
        enrolledSubjects = enrolledRes ?? [];
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors du chargement des matières.';
      });
    } finally {
      setState(() {
        isLoadingAvailable = false;
        isLoadingEnrolled = false;
      });
    }
  }

  Future<void> enroll(dynamic subjectToEnroll) async {
    setState(() {
      error = null;
      successMessage = null;
    });
    try {
      await ApiService.post('/student-subjects', {'subjectId': subjectToEnroll['id']});
      setState(() {
        successMessage = 'Inscription réussie.';
        availableSubjects.removeWhere((subject) => subject['id'] == subjectToEnroll['id']);
        enrolledSubjects.add(subjectToEnroll);
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors de l\'inscription.';
      });
    }
  }

  Future<void> unenroll(dynamic subjectToUnenroll) async {
    setState(() {
      error = null;
      successMessage = null;
    });
    try {
      await ApiService.delete('/student-subjects/${subjectToUnenroll['id']}');
      setState(() {
        successMessage = 'Désinscription réussie.';
        enrolledSubjects.removeWhere((subject) => subject['id'] == subjectToUnenroll['id']);
        availableSubjects.add(subjectToUnenroll);
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors de la désinscription.';
      });
    }
  }

  Widget buildSubjectRow(dynamic subject, bool enrolled) {
    final professor = subject['professor'];
    final classroom = subject['classroom'];

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: ListTile(
        title: Text(subject['name'] ?? 'Sans nom', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          'Professeur : ${professor != null ? '${professor['firstName']} ${professor['lastName']}' : '-'}\n'
          'Classe : ${classroom != null ? '${classroom['name']} - ${classroom['level']}' : '-'}',
        ),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: enrolled ? Colors.redAccent : const Color(0xFF0E2C5A),
          ),
          onPressed: () {
            if (enrolled) {
              unenroll(subject);
            } else {
              enroll(subject);
            }
          },
          child: Text(enrolled ? 'Se désinscrire' : "S'inscrire"),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes matières'),
        backgroundColor: const Color(0xFF0E2C5A),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: error != null
            ? Center(
                child: Text(
                  error!,
                  style: const TextStyle(color: Colors.red, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (successMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(successMessage!, style: const TextStyle(color: Colors.green, fontSize: 16)),
                    ),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Matières disponibles', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          const SizedBox(height: 8),
                          isLoadingAvailable
                              ? const Center(child: CircularProgressIndicator())
                              : availableSubjects.isEmpty
                                  ? const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 8.0),
                                      child: Text('Aucune matière disponible pour inscription.'),
                                    )
                                  : ListView.builder(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: availableSubjects.length,
                                      itemBuilder: (context, index) {
                                        final subject = availableSubjects[index];
                                        return buildSubjectRow(subject, false);
                                      },
                                    ),
                          const SizedBox(height: 24),
                          const Text('Matières inscrites', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          const SizedBox(height: 8),
                          isLoadingEnrolled
                              ? const Center(child: CircularProgressIndicator())
                              : enrolledSubjects.isEmpty
                                  ? const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 8.0),
                                      child: Text("Vous n'êtes inscrit à aucune matière."),
                                    )
                                  : ListView.builder(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: enrolledSubjects.length,
                                      itemBuilder: (context, index) {
                                        final subject = enrolledSubjects[index];
                                        return buildSubjectRow(subject, true);
                                      },
                                    ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}