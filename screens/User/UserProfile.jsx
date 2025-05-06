import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "https://be-nhahangviet.onrender.com";

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({ username: res.data.username, email: res.data.email });
    } catch (err) {
      console.error("Lỗi khi lấy người dùng:", err);
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng.");
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/users/me`,
        {
          username: formData.username,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Update thành công:", res.data);
      setIsEditing(false);
      fetchUser();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
    }
  };

  if (!user) return <Text>Đang tải thông tin...</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên đăng nhập:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => handleChange("username", text)}
              />
            ) : (
              <Text style={styles.textValue}>{user.username}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
              />
            ) : (
              <Text style={styles.textValue}>{user.email}</Text>
            )}
          </View>

          <View style={styles.buttons}>
            {isEditing ? (
              <>
                <Button title="Lưu" onPress={handleUpdate} color="#28a745" />
                <Button
                  title="Hủy"
                  onPress={() => setIsEditing(false)}
                  color="#6c757d"
                />
              </>
            ) : (
              <Button
                title="Chỉnh sửa"
                onPress={() => setIsEditing(true)}
                color="#007bff"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Màu nền sáng
  },
  container: {
    flexGrow: 1,
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 400, // Giới hạn độ rộng của card
    elevation: 5, // Để có bóng nhẹ cho card (Android)
    shadowColor: "#000", // Bóng đổ cho iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: "#f9f9f9", // Màu nền input
  },
  textValue: {
    fontSize: 16,
    color: "#555",
    padding: 10,
    backgroundColor: "#f9f9f9", // Màu nền cho text khi không chỉnh sửa
    borderRadius: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between", // Giữa các button
    marginTop: 20,
  },
});

export default UserProfile;
