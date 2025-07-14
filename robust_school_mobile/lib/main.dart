import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import '../screens/LoginScreen.dart';
import '../screens/ProfDashboardScreen.dart';
import '../screens/ProfNotesScreen.dart';
import '../screens/ProfDocumentsScreen.dart';
import '../screens/ProfTimetableScreen.dart';
import '../screens/EleveDashboardScreen.dart';
import '../screens/EleveNotesScreen.dart';
import '../screens/EleveDocumentsScreen.dart';
import '../screens/EleveSubjectsScreen.dart';
import '../screens/EleveTimetableScreen.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr_FR', null); // 👈 Ajouté pour le support français
  runApp(const RobustSchoolApp());
}

class RobustSchoolApp extends StatelessWidget {
  const RobustSchoolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Robust School Management App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF0E2C5A),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0E2C5A)),
        useMaterial3: true,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),

        // Professeur
        '/prof/dashboard': (context) => const ProfDashboardScreen(),
        '/prof/notes': (context) => const ProfNotesScreen(),
        '/prof/documents': (context) => const ProfDocumentsScreen(),
        '/prof/timetable': (context) => const ProfTimetableScreen(),

        // Élève
        '/eleve/dashboard': (context) => const EleveDashboardScreen(),
        '/eleve/notes': (context) => const EleveNotesScreen(),
        '/eleve/documents': (context) => const EleveDocumentsScreen(),
        '/eleve/subjects': (context) => const EleveSubjectsScreen(),
        '/eleve/timetable': (context) => const EleveTimetableScreen(),
      },
    );
  }
}