// ==================== All Import
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Auth from "./screens/Auth/Auth";
import AdminDashboard from "./screens/Admin/AdminDashboard";
import UserStack from "./screens/User/UserStack"; // 👈 import thêm

// ==================== All Hooks
const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedRole = await AsyncStorage.getItem("role");
        if (token && savedRole) {
          setIsLoggedIn(true);
          setRole(savedRole);
        }
      } catch (err) {
        console.log("Lỗi khi đọc AsyncStorage:", err);
      }
    };
    checkLogin();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth">
            {(props) => (
              <Auth
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                setRole={setRole}
              />
            )}
          </Stack.Screen>
        ) : role === "admin" ? (
          <Stack.Screen name="AdminDashboard">
            {(props) => (
              <AdminDashboard
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                setRole={setRole}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="UserStack">
            {(props) => (
              <UserStack
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                setRole={setRole}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
