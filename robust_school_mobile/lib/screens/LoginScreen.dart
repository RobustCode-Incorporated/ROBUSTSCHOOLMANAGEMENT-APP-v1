import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isLoading = false;
  String? error;

  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<void> handleLogin() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    final email = emailController.text.trim();
    final password = passwordController.text;

    try {
      final response = await ApiService.login(email, password);
      await storage.write(key: 'token', value: response['token']);
      await storage.write(key: 'user', value: jsonEncode(response['user']));

      final role = response['user']['role'];

      if (!mounted) return;

      if (role == 'prof') {
        Navigator.pushReplacementNamed(context, '/prof/dashboard');
      } else if (role == 'eleve') {
        Navigator.pushReplacementNamed(context, '/eleve/dashboard');
      } else {
        setState(() {
          error = "Rôle inconnu.";
        });
      }
    } catch (e) {
      setState(() {
        error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FA),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // ✅ Logo au-dessus
              Image.asset(
                'assets/logo_black.png',
                width: 100,
              ),
              const SizedBox(height: 12),

              const Text(
                'Robust School Management App',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0E2C5A),
                  fontFamily: 'YsabeauOffice',
                ),
              ),

              const SizedBox(height: 30),

              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(fontFamily: 'ABeeZee'),
                decoration: const InputDecoration(
                  labelText: 'Adresse e-mail',
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 12),

              TextField(
                controller: passwordController,
                obscureText: true,
                style: const TextStyle(fontFamily: 'ABeeZee'),
                decoration: const InputDecoration(
                  labelText: 'Mot de passe',
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              if (error != null)
                Text(
                  error!,
                  style: const TextStyle(color: Colors.red),
                ),

              const SizedBox(height: 10),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: isLoading ? null : handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF104B71),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'CONNEXION',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 16,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}