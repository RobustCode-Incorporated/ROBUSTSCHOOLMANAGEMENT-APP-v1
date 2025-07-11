import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;


class ApiService {
  static const String baseUrl = 'http://172.20.10.7:5050/api'; // change selon ton backend
  static final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // ✅ ➕ Ajouté pour les cas où on a besoin des headers prêts à l’emploi
  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // 🔐 Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data;
    } else {
      final errorBody = response.body.isNotEmpty ? jsonDecode(response.body) : null;
      throw Exception(errorBody != null && errorBody['message'] != null
          ? errorBody['message']
          : 'Erreur lors de la connexion');
    }
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'token');
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final userJson = await _storage.read(key: 'user');
    if (userJson == null) return null;
    try {
      return jsonDecode(userJson);
    } catch (e) {
      return null;
    }
  }

  static Future<dynamic> get(String endpoint) async {
    final headers = await getAuthHeaders();
    final response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
    return _processResponse(response);
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await getAuthHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return _processResponse(response);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await getAuthHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return _processResponse(response);
  }

  static Future<dynamic> delete(String endpoint) async {
    final headers = await getAuthHeaders();
    final response = await http.delete(Uri.parse('$baseUrl$endpoint'), headers: headers);
    return _processResponse(response);
  }

  static dynamic _processResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;

    if (statusCode >= 200 && statusCode < 300) {
      return body;
    } else {
      throw Exception(body != null && body['message'] != null
          ? body['message']
          : 'Erreur serveur: $statusCode');
    }
  }

  static Future<void> logout() async {
    await _storage.delete(key: 'token');
    await _storage.delete(key: 'user');
  }
}