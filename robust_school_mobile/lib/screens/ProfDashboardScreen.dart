import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfDashboardScreen extends StatefulWidget {
  const ProfDashboardScreen({Key? key}) : super(key: key);

  @override
  State<ProfDashboardScreen> createState() => _ProfDashboardScreenState();
}

class _ProfDashboardScreenState extends State<ProfDashboardScreen> {
  String? firstName;
  String? lastName;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadUserInfo();
  }

  Future<void> loadUserInfo() async {
    try {
      final user = await ApiService.getCurrentUser();
      if (!mounted) return;
      setState(() {
        firstName = user?['firstName'] ?? 'Professeur';
        lastName = user?['lastName'] ?? '';
        isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        firstName = 'Professeur';
        lastName = '';
        isLoading = false;
      });
    }
  }

  Future<void> logout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final fullName = isLoading ? 'Chargement...' : '$firstName $lastName';

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E2C5A),
        elevation: 0,
        title: Row(
          children: [
            Image.asset(
              'assets/logo_white.png',
              width: 36,
              height: 36,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Bienvenue $fullName',
                style: const TextStyle(
                  fontFamily: 'YsabeauOffice',
                  fontSize: 18,
                  color: Colors.white,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white),
              tooltip: 'Se déconnecter',
              onPressed: logout,
            )
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          children: [
            _buildCard(
              icon: Icons.bar_chart,
              label: '📊 Gestion des notes',
              onTap: () => Navigator.pushNamed(context, '/prof/notes'),
            ),
            const SizedBox(height: 16),
            _buildCard(
              icon: Icons.folder,
              label: '📁 Gestion des documents',
              onTap: () => Navigator.pushNamed(context, '/prof/documents'),
            ),
            const SizedBox(height: 16),
            _buildCard(
              icon: Icons.calendar_today,
              label: "📅 Voir l'emploi du temps",
              onTap: () => Navigator.pushNamed(context, '/prof/timetable'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF0E2C5A), size: 28),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'ABeeZee',
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0E2C5A),
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF0E2C5A))
            ],
          ),
        ),
      ),
    );
  }
}