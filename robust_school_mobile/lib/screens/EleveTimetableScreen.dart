import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EleveTimetableScreen extends StatefulWidget {
  const EleveTimetableScreen({super.key});

  @override
  State<EleveTimetableScreen> createState() => _EleveTimetableScreenState();
}

class _EleveTimetableScreenState extends State<EleveTimetableScreen> {
  List<dynamic> timetable = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchTimetable();
  }

  Future<void> fetchTimetable() async {
    try {
      final res = await ApiService.get('/timetable/eleve');
      setState(() {
        timetable = res;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString().replaceAll('Exception: ', '');
        isLoading = false;
      });
    }
  }

  String capitalize(String s) =>
      s.isNotEmpty ? s[0].toUpperCase() + s.substring(1) : s;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📅 Mon emploi du temps'),
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
                          'Aucun créneau trouvé.',
                          style: TextStyle(fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        itemCount: timetable.length,
                        itemBuilder: (context, index) {
                          final entry = timetable[index];
                          final day = capitalize(entry['dayOfWeek'] ?? 'Inconnu');
                          final subject = entry['timetableSubject']?['name'] ?? 'Matière inconnue';
                          final start = entry['startTime'] ?? '-';
                          final end = entry['endTime'] ?? '-';
                          final location = entry['location'] ?? '-';
                          final prof = entry['timetableProfessor'];
                          final profName = prof != null
                              ? '${prof['firstName']} ${prof['lastName']}'
                              : 'Professeur inconnu';

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
                                  Text(
                                    '$day : $subject',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF0E2C5A),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.schedule, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Text('De $start à $end'),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.person, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Text(profName),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 20, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Text(location),
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