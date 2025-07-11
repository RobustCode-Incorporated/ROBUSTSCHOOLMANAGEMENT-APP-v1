import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EleveNotesScreen extends StatefulWidget {
  const EleveNotesScreen({super.key});

  @override
  State<EleveNotesScreen> createState() => _EleveNotesScreenState();
}

class _EleveNotesScreenState extends State<EleveNotesScreen> {
  List<dynamic> notes = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchNotes();
  }

  Future<void> fetchNotes() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final res = await ApiService.get('/notes');
      setState(() {
        notes = res ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString().replaceAll('Exception: ', '');
        isLoading = false;
      });
    }
  }

  String formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes notes'),
        backgroundColor: const Color(0xFF0E2C5A),
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: Text(
                      error!,
                      style: const TextStyle(color: Colors.red, fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  )
                : notes.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucune note disponible.',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        itemCount: notes.length,
                        itemBuilder: (context, index) {
                          final note = notes[index];
                          final subject = note['subject']?['name'] ?? 'Matière inconnue';
                          final classroom = note['classroom'] != null
                              ? '${note['classroom']['name']} - ${note['classroom']['level']}'
                              : 'Classe inconnue';
                          final comment = note['comment']?.toString().isNotEmpty == true
                              ? note['comment']
                              : '-';
                          final date = formatDate(note['date']);

                          return Card(
                            elevation: 3,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$subject — $classroom',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      color: Color(0xFF0E2C5A),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.score, size: 20, color: Colors.blueGrey),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Note : ${note['value']} / 20',
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.comment, size: 20, color: Colors.blueGrey),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Commentaire : $comment',
                                          style: const TextStyle(fontSize: 16),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today, size: 20, color: Colors.blueGrey),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Date : $date',
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}