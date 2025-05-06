// ==================== All Import
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserDashboard = ({ navigation, setIsLoggedIn, setRole }) => {
  // ==================== Xử lý đăng xuất
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng bạn</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("BookUser")}
      >
        <Text style={styles.buttonText}>📅 Đặt Bàn</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("BookingHistory")}
      >
        <Text style={styles.buttonText}>📖 Lịch Sử Đặt Bàn</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("UserProfile")}
      >
        <Text style={styles.buttonText}>👤 Thông Tin Tài Khoản</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserDashboard;

// ==================== Style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2C6B2F",
    textAlign: "center",
  },
  button: {
    width: "80%",
    backgroundColor: "#2C6B2F",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#F44336",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
  },
});
