import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<void> login(String email, String password) async {
    final data = await ApiService.login(email, password);
    _token = data['token'];
    _user = User.fromJson(data['user']);
    // Stockage token et user via ApiService ou ici directement si besoin
    notifyListeners();
  }

  Future<void> logout() async {
    await ApiService.logout();
    _token = null;
    _user = null;
    notifyListeners();
  }
}