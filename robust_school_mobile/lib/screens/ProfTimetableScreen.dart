import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class ProfTimetableScreen extends StatefulWidget {
  const ProfTimetableScreen({super.key});

  @override
  State<ProfTimetableScreen> createState() => _ProfTimetableScreenState();
}

class _ProfTimetableScreenState extends State<ProfTimetableScreen> {
  List<dynamic> timetable = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchTimetable();
  }

  Future<void> fetchTimetable() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final res = await ApiService.get('/timetable/professeur');
      setState(() {
        timetable = res ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors du chargement de l\'emploi du temps.';
        isLoading = false;
      });
    }
  }

  String capitalize(String s) {
    return s.isNotEmpty ? '${s[0].toUpperCase()}${s.substring(1)}' : s;
  }

  String formatDateFr(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final formatter = DateFormat('EEEE dd/MM/yyyy', 'fr_FR');
      return capitalize(formatter.format(date));
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("📅 Mon emploi du temps"),
        backgroundColor: const Color(0xFF0E2C5A),
        foregroundColor: Colors.white,
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
                : timetable.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucun créneau disponible.',
                          style: TextStyle(fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        itemCount: timetable.length,
                        itemBuilder: (context, index) {
                          final entry = timetable[index];

                          // Date formatée (si disponible)
                          final dateStr = entry['date'];
                          final formattedDate =
                              dateStr != null ? formatDateFr(dateStr) : '';

                          // Jour de la semaine (fallback si pas de date)
                          final day = capitalize(entry['dayOfWeek'] ?? '');

                          final start = entry['startTime'] ?? '';
                          final end = entry['endTime'] ?? '';
                          final time = (start.isNotEmpty && end.isNotEmpty)
                              ? '$start - $end'
                              : 'Horaire inconnu';

                          final subject =
                              entry['timetableSubject']?['name'] ?? 'Matière inconnue';

                          final classroom = entry['timetableClassroom'] != null
                              ? '${entry['timetableClassroom']['name']} (${entry['timetableClassroom']['level']})'
                              : 'Classe inconnue';

                          final location = (entry['location'] ?? '').toString().trim();
                          final locationDisplay =
                              location.isNotEmpty ? location : 'Non précisé';

                          return Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 4,
                            margin: const EdgeInsets.symmetric(vertical: 8.0),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (formattedDate.isNotEmpty)
                                    Text(
                                      formattedDate,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0E2C5A),
                                      ),
                                    )
                                  else if (day.isNotEmpty)
                                    Text(
                                      day,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0E2C5A),
                                      ),
                                    ),
                                  const SizedBox(height: 8),
                                  Text(
                                    time,
                                    style: const TextStyle(
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.book, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text('Matière : $subject')),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.group, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text('Classe : $classroom')),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text('Lieu : $locationDisplay')),
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