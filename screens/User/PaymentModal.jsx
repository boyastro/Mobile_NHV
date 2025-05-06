// src/components/PaymentModal.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "http://192.168.1.11:5000";

  const handlePayment = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ Token không có, không thể thanh toán.");
        return;
      }

      const res = await axios.patch(
        `${API_BASE_URL}/api/bookings/${booking._id}/pay`,
        { isPaid: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onPaymentSuccess(res.data); // Notify parent component on success
    } catch (err) {
      console.error("❌ Error during payment:", err.message);
    }
  };

  const calculateLineTotal = (price, quantity) => price * quantity;

  const calculateTotalAmount = () => {
    return booking.selectedDishes.reduce((total, dishItem) => {
      return (
        total + calculateLineTotal(dishItem.dishId.price, dishItem.quantity)
      );
    }, 0);
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Thanh toán</Text>

        {/* Dish list */}
        <FlatList
          data={booking.selectedDishes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const lineTotal = calculateLineTotal(
              item.dishId.price,
              item.quantity
            );
            return (
              <View style={styles.dishRow}>
                <Text style={styles.dishName}>
                  {item.dishId?.name || "Tên món"}
                </Text>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Text style={styles.price}>
                  {item.dishId?.price?.toLocaleString("vi-VN")} đ
                </Text>
                <Text style={styles.lineTotal}>
                  {lineTotal.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            );
          }}
        />

        {/* Total */}
        <Text style={styles.totalAmount}>
          Tổng cộng: {calculateTotalAmount().toLocaleString("vi-VN")} đ
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handlePayment} style={styles.payButton}>
            <Text style={styles.buttonText}>Thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dishRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dishName: {
    flex: 2,
  },
  quantity: {
    flex: 1,
    textAlign: "center",
  },
  price: {
    flex: 1,
    textAlign: "right",
  },
  lineTotal: {
    flex: 1,
    textAlign: "right",
  },
  totalAmount: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 16,
    color: "green",
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default PaymentModal;
