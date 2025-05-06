// ==================== All Import
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://192.168.1.11:5000"; // Đổi thành IP LAN nếu test trên thiết bị thật

const Auth = ({ setIsLoggedIn, setRole }) => {
  // ==================== All Hooks
  const [form, setForm] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==================== All Functions

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Lưu vào AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("role", data.role);

        setIsLoggedIn(true);
        setRole(data.role);
        setForm("logout");
      } else {
        Alert.alert("Lỗi", data.message);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không kết nối được tới server.");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Thành công",
          "Tạo tài khoản thành công! Vui lòng đăng nhập."
        );
        setForm("login");
      } else {
        Alert.alert("Lỗi", data.message);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không kết nối được tới server.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
    setForm("login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {form === "login" && (
          <>
            <Text style={styles.title}>Đăng nhập</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Tên đăng nhập"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
              secureTextEntry
              style={styles.input}
            />
            <Pressable onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </Pressable>
            <Text>
              Chưa có tài khoản?{" "}
              <Text style={styles.link} onPress={() => setForm("signup")}>
                Đăng ký
              </Text>
            </Text>
          </>
        )}

        {form === "signup" && (
          <>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Tên đăng nhập"
              style={styles.input}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
              secureTextEntry
              style={styles.input}
            />
            <Pressable onPress={handleSignup} style={styles.button}>
              <Text style={styles.buttonText}>Đăng ký</Text>
            </Pressable>
            <Text>
              Đã có tài khoản?{" "}
              <Text style={styles.link} onPress={() => setForm("login")}>
                Đăng nhập
              </Text>
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default Auth;

// ==================== All Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#AD343E",
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#AD343E",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    color: "#AD343E",
    fontWeight: "600",
  },
});
