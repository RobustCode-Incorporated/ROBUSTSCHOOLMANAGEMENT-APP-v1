import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'api_service.dart';
import 'package:flutter/material.dart';

class DownloadService {
  static Future<void> downloadFile({
    required BuildContext context,
    required String filename,
  }) async {
    final token = await ApiService.getToken();
    if (token == null) {
      _showSnackbar(context, 'Non authentifié. Veuillez vous reconnecter.');
      return;
    }

    // Pas de permission nécessaire : le fichier va dans le dossier privé de l'app
    // (Permission.storage est toujours refusée sur Android 13+ et n'existe pas sur iOS)
    final baseUrl = ApiService.baseUrl;
    final url = '$baseUrl/documents/download/$filename';

    try {
      final dio = Dio();
      final dir = await getApplicationDocumentsDirectory();
      final filepath = '${dir.path}/$filename';

      final response = await dio.download(
        url,
        filepath,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
          responseType: ResponseType.bytes,
        ),
      );

      if (response.statusCode == 200) {
        _showSnackbar(context, 'Téléchargement terminé.');
        await OpenFile.open(filepath);
      } else {
        _showSnackbar(context, 'Erreur lors du téléchargement.');
      }
    } catch (e) {
      _showSnackbar(context, 'Erreur: ${e.toString()}');
    }
  }

  static void _showSnackbar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}