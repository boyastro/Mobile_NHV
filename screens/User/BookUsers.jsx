import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { StatusBar } from "react-native";

const BookUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    people: 1,
    note: "",
    selectedDishes: [],
  });
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "https://be-nhahangviet.onrender.com";

  useEffect(() => {
    // Set StatusBar style for the app
    StatusBar.setBarStyle("dark-content", true); // Dark content style for status bar
    StatusBar.setBackgroundColor("#ffffff"); // White background for status bar

    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/menus`);
        setMenuItems(res.data);
      } catch (err) {
        console.error("❌ Error fetching menu:", err.message);
      }
    };
    fetchMenu();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDish = (dishId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedDishes.some(
        (dish) => dish.dishId === dishId
      );
      const updatedDishes = isSelected
        ? prev.selectedDishes.filter((dish) => dish.dishId !== dishId)
        : [...prev.selectedDishes, { dishId, quantity: 1 }];
      return { ...prev, selectedDishes: updatedDishes };
    });
  };

  const updateQuantity = (dishId, change) => {
    setFormData((prev) => {
      const updatedDishes = prev.selectedDishes.map((dish) => {
        if (dish.dishId === dishId) {
          const newQuantity = dish.quantity + change;
          return { ...dish, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return dish;
      });
      return { ...prev, selectedDishes: updatedDishes };
    });
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage

      if (!token) {
        Alert.alert("❌ Bạn chưa đăng nhập.");
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/api/bookings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("✅ Đặt bàn thành công!");
      setFormData({
        name: "",
        phone: "",
        date: "",
        time: "",
        people: 1,
        note: "",
        selectedDishes: [],
      });
    } catch (err) {
      console.error(
        "❌ Error while submitting:",
        err.response ? err.response.data : err.message
      );
      Alert.alert(
        "❌ Lỗi khi gửi dữ liệu. Vui lòng kiểm tra lại thông tin hoặc thử lại sau."
      );
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      handleChange("date", dateString);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      handleChange("time", `${hours}:${minutes}`);
    }
  };

  const filteredMenu =
    selectedCategory === "Tất cả"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const categories = [
    "Tất cả",
    "Bữa Sáng",
    "Bữa Trưa",
    "Đồ Uống",
    "Tráng Miệng",
  ];

  const renderDishItem = ({ item: dish }) => {
    const selectedDish = formData.selectedDishes.find(
      (d) => d.dishId === dish._id
    );
    const isSelected = !!selectedDish;
    const quantity = selectedDish ? selectedDish.quantity : 0;

    return (
      <TouchableOpacity
        key={dish._id}
        style={{
          flexDirection: "row",
          padding: 10,
          borderWidth: 1,
          borderColor: isSelected ? "#1D4ED8" : "#D1D5DB",
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: isSelected ? "#EFF6FF" : "#fff",
        }}
        onPress={() => toggleDish(dish._id)}
      >
        <Image
          source={{
            uri: dish.image || "https://via.placeholder.com/150?text=No+Image",
          }}
          style={{
            width: 50,
            height: 50,
            marginRight: 10,
            borderRadius: 5,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            {dish.name}
          </Text>
          <Text style={{ color: "#6B7280" }}>{dish.category}</Text>
          <Text
            style={{
              color: "#EF4444",
              fontWeight: "bold",
              marginTop: 5,
            }}
          >
            {Number(dish.price).toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* Quantity buttons */}
        {isSelected && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => updateQuantity(dish._id, -1)}
              style={{
                padding: 5,
                backgroundColor: "#EF4444",
                borderRadius: 10,
                marginRight: 10,
              }}
            >
              <Text style={{ color: "#fff" }}>-</Text>
            </TouchableOpacity>
            <Text>{quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(dish._id, 1)}
              style={{
                padding: 5,
                backgroundColor: "#10B981",
                borderRadius: 10,
                marginLeft: 10,
              }}
            >
              <Text style={{ color: "#fff" }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            📝 Đặt Bàn
          </Text>

          {/* Customer Info */}
          <View style={{ marginBottom: 20 }}>
            <TextInput
              placeholder="Họ và tên"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              placeholder="Số điện thoại"
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            />

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text>{formData.date || "Chọn ngày đặt"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.date ? new Date(formData.date) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}

            {/* Time Picker */}
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text>{formData.time || "Chọn giờ đặt"}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />
            )}

            <TextInput
              placeholder="Số người"
              value={String(formData.people)}
              onChangeText={(text) => handleChange("people", Number(text))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              placeholder="Ghi chú"
              value={formData.note}
              onChangeText={(text) => handleChange("note", text)}
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
              }}
            />
          </View>

          {/* Select category */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold" }}>🍽️ Chọn món ăn kèm:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    backgroundColor:
                      selectedCategory === cat ? "#1D4ED8" : "#fff",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    margin: 5,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat ? "#fff" : "#000",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Menu List */}
          <FlatList
            data={filteredMenu}
            renderItem={renderDishItem}
            keyExtractor={(item) => item._id}
          />

          <Button title="Xác nhận đặt bàn" onPress={handleSubmit} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default BookUser;
