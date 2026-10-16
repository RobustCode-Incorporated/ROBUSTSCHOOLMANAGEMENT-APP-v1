import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import '../services/api_service.dart';

class ProfDocumentsScreen extends StatefulWidget {
  const ProfDocumentsScreen({super.key});

  @override
  State<ProfDocumentsScreen> createState() => _ProfDocumentsScreenState();
}

class _ProfDocumentsScreenState extends State<ProfDocumentsScreen> {
  List<dynamic> documents = [];
  List<dynamic> classrooms = [];
  List<dynamic> subjects = [];

  String? selectedClassroomId;
  String? selectedSubjectId;
  PlatformFile? selectedFile;

  String? error;
  String? successMessage;
  bool isLoading = false;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    fetchInitialData();
  }

  Future<void> fetchInitialData() async {
    try {
      final resDocs = await ApiService.get('/documents');
      final resClasses = await ApiService.get('/classrooms');
      final resSubjects = await ApiService.get('/subjects');

      setState(() {
        documents = resDocs ?? [];
        classrooms = resClasses ?? [];
        subjects = resSubjects ?? [];
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors du chargement initial.';
      });
    }
  }

  String getClassroomName(dynamic id) {
    final cls = classrooms.firstWhere((c) => c['id'] == id, orElse: () => null);
    return cls != null ? '${cls['name']} - ${cls['level']}' : '-';
  }

  String getSubjectName(dynamic id) {
    final subj = subjects.firstWhere((s) => s['id'] == id, orElse: () => null);
    return subj != null ? subj['name'] : '-';
  }

  Future<void> pickFile() async {
    final file = await FilePicker.pickFile();
    if (file != null) {
      setState(() {
        selectedFile = file;
      });
    }
  }

  Future<void> uploadDocument() async {
    if (selectedClassroomId == null || selectedSubjectId == null || selectedFile == null) {
      setState(() {
        error = 'Veuillez remplir tous les champs.';
        successMessage = null;
      });
      return;
    }

    setState(() {
      isLoading = true;
      error = null;
      successMessage = null;
    });

    try {
      final file = selectedFile!;
      final length = file.lengthSync() ?? await file.length();
      if (length == null) {
        setState(() {
          error = 'Impossible de lire le fichier.';
          isLoading = false;
        });
        return;
      }

      final formData = FormData.fromMap({
        'file': MultipartFile.fromStream(
          file.readAsByteStream,
          length,
          filename: file.name,
          contentType: MediaType('application', 'octet-stream'),
        ),
        'classroomId': selectedClassroomId,
        'subjectId': selectedSubjectId,
      });

      final dio = Dio(BaseOptions(
        baseUrl: ApiService.baseUrl,
        headers: await ApiService.getAuthHeaders(),
      ));

      await dio.post('/documents', data: formData);

      setState(() {
        successMessage = 'Document téléversé avec succès.';
        selectedClassroomId = null;
        selectedSubjectId = null;
        selectedFile = null;
      });

      await fetchInitialData();
    } catch (e) {
      setState(() {
        error = 'Erreur lors du téléversement : ${e.toString()}';
        successMessage = null;
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> downloadDocument(String filename) async {
    final token = await _storage.read(key: 'token');

    if (token == null) {
      showSnackBar('Utilisateur non authentifié');
      return;
    }

    // Pas de permission nécessaire : le fichier va dans le dossier privé de l'app
    // (Permission.storage est toujours refusée sur Android 13+ et n'existe pas sur iOS)
    final url = '${ApiService.baseUrl}/documents/download/$filename';

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
        title: const Text('Gestion des documents'),
        backgroundColor: const Color(0xFF0E2C5A),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              'Téléverser un document',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 20,
                color: Color(0xFF0E2C5A),
              ),
            ),
            const SizedBox(height: 16),

            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Classe',
                border: OutlineInputBorder(),
              ),
              value: selectedClassroomId,
              items: classrooms.map((cls) {
                return DropdownMenuItem(
                  value: cls['id'].toString(),
                  child: Text('${cls['name']} - ${cls['level']}'),
                );
              }).toList(),
              onChanged: (val) => setState(() => selectedClassroomId = val),
            ),
            const SizedBox(height: 12),

            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Matière',
                border: OutlineInputBorder(),
              ),
              value: selectedSubjectId,
              items: subjects.map((subj) {
                return DropdownMenuItem(
                  value: subj['id'].toString(),
                  child: Text(subj['name']),
                );
              }).toList(),
              onChanged: (val) => setState(() => selectedSubjectId = val),
            ),
            const SizedBox(height: 12),

            ElevatedButton.icon(
              icon: const Icon(Icons.attach_file),
              label: Text(selectedFile?.name ?? 'Choisir un fichier'),
              onPressed: pickFile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0E2C5A),
                minimumSize: const Size.fromHeight(48),
              ),
            ),
            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: isLoading ? null : uploadDocument,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0E2C5A),
                minimumSize: const Size.fromHeight(48),
              ),
              child: isLoading
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text(
                      'Téléverser',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
            ),

            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(error!, style: const TextStyle(color: Colors.red)),
              ),
            if (successMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(successMessage!, style: const TextStyle(color: Colors.green)),
              ),

            const Divider(height: 40),

            const Text(
              'Documents envoyés',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 20,
                color: Color(0xFF0E2C5A),
              ),
            ),
            const SizedBox(height: 12),

            if (documents.isEmpty)
              const Center(
                child: Text(
                  'Aucun document disponible.',
                  style: TextStyle(color: Colors.grey),
                ),
              )
            else
              ...documents.map((doc) {
                final filename = doc['filename'];
                final originalName = doc['originalName'] ?? 'Sans titre';
                final subject = getSubjectName(doc['subjectId']);
                final classroom = getClassroomName(doc['classroomId']);

                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 6),
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  child: ListTile(
                    title: Text(originalName),
                    subtitle: Text('Matière: $subject\nClasse: $classroom'),
                    trailing: IconButton(
                      icon: const Icon(Icons.download),
                      onPressed: () => downloadDocument(filename),
                      tooltip: 'Télécharger',
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