import React from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminDashboard({ setIsLoggedIn, setRole }) {
  const handleLogout = async () => {
    // Xóa token và role khỏi AsyncStorage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");

    // Cập nhật trạng thái đăng nhập và role
    setIsLoggedIn(false);
    setRole("");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chào Admin!</Text>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}
