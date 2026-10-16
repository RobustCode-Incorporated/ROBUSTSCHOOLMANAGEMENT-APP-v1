import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import '../services/api_service.dart';

class EleveDocumentsScreen extends StatefulWidget {
  const EleveDocumentsScreen({super.key});

  @override
  State<EleveDocumentsScreen> createState() => _EleveDocumentsScreenState();
}

class _EleveDocumentsScreenState extends State<EleveDocumentsScreen> {
  List<dynamic> documents = [];
  List<dynamic> subjects = [];
  List<dynamic> classrooms = [];
  bool isLoading = true;
  String? error;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    loadAllData();
  }

  Future<void> loadAllData() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final subjectsRes = await ApiService.get('/subjects');
      final classroomsRes = await ApiService.get('/classrooms');
      final documentsRes = await ApiService.get('/documents');

      setState(() {
        subjects = subjectsRes ?? [];
        classrooms = classroomsRes ?? [];
        documents = documentsRes ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = "Erreur lors du chargement des documents.";
        isLoading = false;
      });
    }
  }

  String getSubjectName(dynamic id) {
    final subj = subjects.firstWhere(
      (element) => element['id'] == id,
      orElse: () => null,
    );
    return subj != null ? subj['name'] ?? '-' : '-';
  }

  String getClassroomName(dynamic id) {
    final cls = classrooms.firstWhere(
      (element) => element['id'] == id,
      orElse: () => null,
    );
    if (cls != null) {
      final name = cls['name'] ?? '-';
      final level = cls['level'] ?? '-';
      return '$name - $level';
    }
    return '-';
  }

  Future<void> downloadDocument(String filename) async {
    final token = await _storage.read(key: 'token');

    if (token == null) {
      showSnackBar('Utilisateur non authentifié');
      return;
    }

    // Pas de permission nécessaire : le fichier va dans le dossier privé de l'app
    // (Permission.storage est toujours refusée sur Android 13+ et n'existe pas sur iOS)
    final baseUrl = ApiService.baseUrl;
    final url = '$baseUrl/documents/download/$filename';

    try {
      final dio = Dio();
      final dir = await getApplicationDocumentsDirectory();
      final filePath = '${dir.path}/$filename';

      final response = await dio.download(
        url,
        filePath,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          responseType: ResponseType.bytes,
          followRedirects: false,
          validateStatus: (status) => status != null && status < 500,
        ),
      );

      if (response.statusCode == 200) {
        showSnackBar('Téléchargement terminé');
        await OpenFile.open(filePath);
      } else {
        showSnackBar('Erreur lors du téléchargement');
      }
    } catch (e) {
      showSnackBar('Erreur lors du téléchargement');
    }
  }

  void showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes documents'),
        backgroundColor: const Color(0xFF0E2C5A),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: Text(
                      error!,
                      style: const TextStyle(color: Colors.red, fontSize: 16),
                    ),
                  )
                : documents.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucun document disponible.',
                          style: TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        itemCount: documents.length,
                        itemBuilder: (context, index) {
                          final doc = documents[index];
                          final title = doc['originalName'] ?? 'Sans titre';
                          final subjectName = getSubjectName(doc['subjectId']);
                          final classroomName = getClassroomName(doc['classroomId']);
                          final filename = doc['filename'] ?? '';

                          return Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: ListTile(
                              title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text('Matière: $subjectName\nClasse: $classroomName'),
                              trailing: IconButton(
                                icon: const Icon(Icons.download, color: Color(0xFF0E2C5A)),
                                onPressed: () => downloadDocument(filename),
                                tooltip: 'Télécharger',
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}