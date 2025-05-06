import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  ScrollView, // Thêm ScrollView
  Alert, // Thêm Alert để thông báo lỗi
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import DateTimePicker from "@react-native-community/datetimepicker";
const EditBookingModal = ({ booking, onClose, onSave }) => {
  const [updatedBooking, setUpdatedBooking] = useState({
    ...booking,
    selectedDishes: booking.selectedDishes || [],
    // Chuyển đổi date sang string nếu nó là Date object, giữ nguyên nếu là string
    date:
      booking.date instanceof Date
        ? booking.date.toISOString().split("T")[0]
        : booking.date,
  });

  const [menuList, setMenuList] = useState([]);
  const [currentTotalAmount, setCurrentTotalAmount] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "http://192.168.1.11:5000";

  // Hàm tính tổng tiền (tương tự như trong BookingHistory)
  const calculateTotalAmount = (selectedDishes) => {
    if (!selectedDishes || selectedDishes.length === 0) return 0;

    return selectedDishes.reduce((total, dishItem) => {
      // Lấy giá từ dishId hoặc trực tiếp từ dishItem
      const price =
        dishItem.dishId && typeof dishItem.dishId === "object"
          ? dishItem.dishId.price
          : dishItem.price;

      // Chuyển price từ chuỗi sang số (nếu là chuỗi)
      const priceNumber = typeof price === "string" ? parseFloat(price) : price;

      // Kiểm tra price và quantity có phải là số hợp lệ không
      if (
        typeof priceNumber === "number" &&
        !isNaN(priceNumber) &&
        typeof dishItem.quantity === "number" &&
        !isNaN(dishItem.quantity)
      ) {
        return total + priceNumber * dishItem.quantity;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/menus`);
        setMenuList(res.data);
      } catch (err) {
        console.error(
          "❌ Lỗi khi lấy danh sách món ăn:",
          err.response?.data || err.message
        );
        Alert.alert("Lỗi", "Không thể tải danh sách món ăn.");
      }
    };
    fetchMenu();
  }, []);

  // Cập nhật tổng tiền hiện tại mỗi khi selectedDishes thay đổi
  useEffect(() => {
    const total = calculateTotalAmount(updatedBooking.selectedDishes);
    setCurrentTotalAmount(total);
  }, [updatedBooking.selectedDishes]);

  const handleChange = (name, value) => {
    setUpdatedBooking((prev) => ({
      ...prev,
      [name]: name === "people" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleAddDish = (dish) => {
    const alreadyAdded = updatedBooking.selectedDishes.some(
      (d) => d.dishId._id === dish._id
    );
    if (!alreadyAdded) {
      setUpdatedBooking((prev) => ({
        ...prev,
        selectedDishes: [
          ...prev.selectedDishes,
          {
            dishId: dish, // dish object bao gồm _id, name, price, image
            quantity: 1,
          },
        ],
      }));
    } else {
      // Tùy chọn: Thông báo món đã được thêm hoặc tự động tăng số lượng
      Alert.alert("Thông báo", "Món này đã có trong danh sách.");
    }
  };

  const handleRemoveDish = (dishIdToRemove) => {
    setUpdatedBooking((prev) => ({
      ...prev,
      selectedDishes: prev.selectedDishes.filter(
        (item) => item.dishId._id !== dishIdToRemove
      ),
    }));
  };

  const handleQuantityChange = (dishIdToChange, quantityText) => {
    const quantity = Number(quantityText);
    if (isNaN(quantity) || quantity < 0) return; // Không cho phép số lượng âm hoặc không phải số

    setUpdatedBooking((prev) => ({
      ...prev,
      selectedDishes: prev.selectedDishes.map((item) =>
        item.dishId._id === dishIdToChange
          ? { ...item, quantity: quantity }
          : item
      ),
    }));
  };

  const handleSave = async () => {
    // Kiểm tra dữ liệu cơ bản
    if (
      !updatedBooking.date ||
      !updatedBooking.time ||
      !updatedBooking.people ||
      updatedBooking.people <= 0
    ) {
      Alert.alert(
        "Thông tin không hợp lệ",
        "Vui lòng điền đầy đủ thông tin Ngày, Thời gian và Số người (lớn hơn 0)."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token"); // Sử dụng AsyncStorage
      if (!token) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
        return;
      }

      const finalTotalAmount = calculateTotalAmount(
        updatedBooking.selectedDishes
      );
      const bookingDataToSend = {
        ...updatedBooking,
        people: Number(updatedBooking.people), // Đảm bảo people là số
        totalAmount: finalTotalAmount, // Gửi totalAmount đã tính toán
      };

      await axios.put(
        `${API_BASE_URL}/api/bookings/${updatedBooking._id}`,
        bookingDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(bookingDataToSend); // Truyền dữ liệu đã cập nhật (bao gồm totalAmount) cho parent
    } catch (err) {
      console.error(
        "❌ Lỗi khi cập nhật đặt bàn:",
        err.response?.data || err.message
      );
      Alert.alert(
        "Lỗi cập nhật",
        err.response?.data?.message ||
          "Không thể cập nhật đặt bàn. Vui lòng thử lại."
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true} // Việc hiển thị modal này được quản lý bởi parent component
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Chỉnh sửa Đặt Bàn</Text>

            <Text style={styles.label}>Ngày</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text>{updatedBooking.date || "Chọn ngày"}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={
                  updatedBooking.date
                    ? new Date(updatedBooking.date)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formatted = selectedDate.toISOString().split("T")[0];
                    handleChange("date", formatted);
                  }
                }}
              />
            )}

            <Text style={styles.label}>Thời gian</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.input}
            >
              <Text>{updatedBooking.time || "Chọn giờ"}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={
                  updatedBooking.time
                    ? new Date(`2000-01-01T${updatedBooking.time}`)
                    : new Date()
                }
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const hours = selectedTime
                      .getHours()
                      .toString()
                      .padStart(2, "0");
                    const minutes = selectedTime
                      .getMinutes()
                      .toString()
                      .padStart(2, "0");
                    handleChange("time", `${hours}:${minutes}`);
                  }
                }}
              />
            )}

            <Text style={styles.label}>Số người</Text>
            <TextInput
              style={styles.input}
              value={String(updatedBooking.people)}
              onChangeText={(text) => handleChange("people", text)}
              keyboardType="numeric"
              placeholder="Nhập số người"
            />

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.textarea}
              value={updatedBooking.note || ""}
              onChangeText={(text) => handleChange("note", text)}
              multiline={true}
              placeholder="Nhập ghi chú (nếu có)"
            />

            <Text style={styles.subTitle}>🍽️ Món ăn đã chọn:</Text>
            {updatedBooking.selectedDishes.length === 0 ? (
              <Text style={styles.emptyText}>Chưa chọn món nào.</Text>
            ) : (
              <FlatList
                data={updatedBooking.selectedDishes}
                keyExtractor={(item) => item.dishId._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.selectedDishItem}>
                    <Image
                      source={{
                        uri:
                          item.dishId.image ||
                          "https://via.placeholder.com/50?text=No+Img",
                      }}
                      style={styles.selectedDishImage}
                    />
                    <View style={styles.selectedDishInfo}>
                      <Text
                        style={styles.selectedDishName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.dishId.name}
                      </Text>
                      <Text style={styles.selectedDishPrice}>
                        {item.dishId.price
                          ? `${item.dishId.price.toLocaleString("vi-VN")} đ`
                          : "N/A"}
                      </Text>
                    </View>
                    <TextInput
                      style={styles.quantityInput}
                      value={String(item.quantity)}
                      onChangeText={(text) =>
                        handleQuantityChange(item.dishId._id, text)
                      }
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveDish(item.dishId._id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false} // FlatList này không cần cuộn riêng
              />
            )}
            <Text style={styles.runningTotalText}>
              Tổng tiền món: {currentTotalAmount.toLocaleString("vi-VN")} đ
            </Text>

            <Text style={styles.subTitle}>🧾 Danh sách món ăn (Menu):</Text>
            {menuList.length === 0 ? (
              <Text style={styles.emptyText}>
                Không có món ăn nào trong menu.
              </Text>
            ) : (
              <FlatList
                data={menuList}
                keyExtractor={(item) => item._id.toString()}
                numColumns={2} // Hiển thị 2 món mỗi hàng
                columnWrapperStyle={styles.menuRow} // Style cho mỗi hàng
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleAddDish(item)}
                  >
                    <Image
                      source={{
                        uri:
                          item.image ||
                          "https://via.placeholder.com/80?text=No+Img",
                      }}
                      style={styles.menuItemImage}
                    />
                    <Text
                      style={styles.menuItemName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.menuItemPrice}>
                      {item.price
                        ? `${item.price.toLocaleString("vi-VN")} đ`
                        : "N/A"}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false} // FlatList này không cần cuộn riêng
              />
            )}
            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.buttonBase, styles.closeButton]}
              >
                <Text style={styles.buttonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.buttonBase, styles.saveButton]}
              >
                <Text style={styles.buttonText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Tăng độ mờ
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15, // Bo tròn hơn
    width: "90%",
    maxHeight: "90%", // Giới hạn chiều cao tối đa
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22, // Tăng kích thước
    fontWeight: "bold",
    marginBottom: 20, // Tăng khoảng cách
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginBottom: 8, // Tăng khoảng cách
    color: "#555",
    fontWeight: "500",
  },
  input: {
    height: 45, // Tăng chiều cao
    borderColor: "#ddd", // Màu border nhạt hơn
    borderWidth: 1,
    marginBottom: 15, // Tăng khoảng cách
    paddingHorizontal: 12, // Tăng padding
    borderRadius: 8, // Bo tròn hơn
    backgroundColor: "#f9f9f9", // Nền nhạt
  },
  textarea: {
    minHeight: 100, // Chiều cao tối thiểu
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingTop: 10, // Padding top cho text area
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25, // Tăng khoảng cách
    marginBottom: 10, // Thêm khoảng cách dưới
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  selectedDishItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, // Thêm padding dọc
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Đường kẻ nhạt hơn
  },
  selectedDishImage: {
    width: 50, // Tăng kích thước
    height: 50,
    borderRadius: 8, // Bo tròn nhẹ
    marginRight: 10,
  },
  selectedDishInfo: {
    flex: 1, // Cho phép chiếm không gian còn lại
    justifyContent: "center",
  },
  selectedDishName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  selectedDishPrice: {
    fontSize: 13,
    color: "#666",
  },
  quantityInput: {
    width: 45, // Tăng chiều rộng
    height: 35, // Tăng chiều cao
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 5, // Thêm padding ngang
    borderRadius: 5,
    textAlign: "center",
    marginHorizontal: 10, // Thêm khoảng cách ngang
    fontSize: 14,
  },
  removeButton: {
    padding: 8, // Tăng vùng chạm
  },
  removeButtonText: {
    color: "#ef4444", // Màu đỏ
    fontSize: 13,
    fontWeight: "500",
  },
  runningTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
    marginBottom: 15,
    textAlign: "right",
  },
  menuRow: {
    justifyContent: "space-between", // Cách đều các item trong hàng
  },
  menuItem: {
    width: "48%", // Cho 2 cột với khoảng cách nhỏ
    marginBottom: 15, // Tăng khoảng cách
    alignItems: "center",
    backgroundColor: "#f9f9f9", // Nền nhạt
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  menuItemImage: {
    width: 80, // Tăng kích thước
    height: 80,
    borderRadius: 8, // Bo tròn nhẹ
    marginBottom: 8, // Tăng khoảng cách
  },
  menuItemName: {
    fontSize: 14, // Tăng kích thước
    fontWeight: "500",
    textAlign: "center",
    color: "#444",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 13,
    color: "green",
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around", // Cách đều các nút
    marginTop: 30, // Tăng khoảng cách
    paddingBottom: 10, // Thêm padding dưới để không sát đáy modal khi cuộn
  },
  buttonBase: {
    // Kiểu cơ sở cho nút
    paddingVertical: 12, // Tăng padding dọc
    paddingHorizontal: 20, // Tăng padding ngang
    borderRadius: 8, // Bo tròn hơn
    minWidth: 120, // Chiều rộng tối thiểu
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#6c757d", // Màu xám đậm hơn
  },
  saveButton: {
    backgroundColor: "#28a745", // Màu xanh lá đậm hơn
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16, // Tăng kích thước chữ
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginVertical: 10,
    fontSize: 14,
  },
});

export default EditBookingModal;
