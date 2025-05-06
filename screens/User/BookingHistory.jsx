import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Giả sử bạn có các modal này trong cùng thư mục hoặc đã import đúng đường dẫn
import EditBookingModal from "./EditBookingModal"; // Đảm bảo file này tồn tại
import PaymentModal from "./PaymentModal"; // Đảm bảo file này tồn tại

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "http://192.168.1.11:5000"; // Thay thế bằng IP hoặc domain của bạn nếu cần

  const calculateTotalAmount = (selectedDishes) => {
    if (!selectedDishes || selectedDishes.length === 0) return 0;
    return selectedDishes.reduce((total, dishItem) => {
      if (
        dishItem &&
        dishItem.dishId &&
        typeof dishItem.dishId.price === "number" &&
        typeof dishItem.quantity === "number"
      ) {
        return total + dishItem.dishId.price * dishItem.quantity;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("Không tìm thấy token xác thực.");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/bookings/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Đảm bảo mỗi booking có totalAmount được tính toán hoặc lấy từ server
        const bookingsWithTotal = res.data.map((booking) => ({
          ...booking,
          // Ưu tiên totalAmount từ server nếu có, nếu không thì tính toán
          totalAmount:
            typeof booking.totalAmount === "number"
              ? booking.totalAmount
              : calculateTotalAmount(booking.selectedDishes || []),
        }));

        const sortedBookings = bookingsWithTotal.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sortedBookings);
      } catch (err) {
        console.error(
          "❌ Lỗi khi lấy lịch sử đặt bàn:",
          err.response ? err.response.data : err.message
        );
      }
    };

    fetchBookings();
  }, []); // API_BASE_URL không thay đổi nên không cần đưa vào dependencies array

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = (updatedBooking) => {
    // Tính toán lại totalAmount khi lưu thay đổi
    const newTotalAmount = calculateTotalAmount(updatedBooking.selectedDishes);
    const bookingToSave = { ...updatedBooking, totalAmount: newTotalAmount };

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === bookingToSave._id ? bookingToSave : booking
      )
    );
    handleCloseModal();
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
    } catch (err) {
      console.error(
        "❌ Lỗi khi xóa đặt bàn:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const handleOpenPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBooking(null);
  };

  const handlePaymentSuccess = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/bookings/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookingsWithTotal = res.data.map((booking) => ({
        ...booking,
        totalAmount:
          typeof booking.totalAmount === "number"
            ? booking.totalAmount
            : calculateTotalAmount(booking.selectedDishes || []),
      }));

      const sortedBookings = bookingsWithTotal.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sortedBookings);
    } catch (err) {
      console.error(
        "❌ Lỗi khi lấy lại lịch sử đặt bàn sau thanh toán:",
        err.response ? err.response.data : err.message
      );
    }
    handleClosePaymentModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item: booking }) => (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text
                  style={styles.bookingTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {booking.name}
                </Text>
                {!booking.isPaid && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => handleEditBooking(booking)}
                      style={styles.editButton}
                    >
                      <Text style={styles.buttonText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteBooking(booking._id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.buttonText}>Xoá</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={[styles.bookingText, styles.detailItemSpacing]}>
                📅 Ngày: {new Date(booking.date).toLocaleDateString("vi-VN")} -
                ⏰ {booking.time}
              </Text>
              <Text style={[styles.bookingText, styles.detailItemSpacing]}>
                👥 Số người: {booking.people}
              </Text>
              <Text style={[styles.bookingText, styles.detailItemSpacing]}>
                📝 Ghi chú: {booking.note || "Không có ghi chú"}
              </Text>
              <Text
                style={[
                  booking.isPaid ? styles.paidText : styles.unpaidText,
                  styles.detailItemSpacing,
                  { marginBottom: booking.selectedDishes?.length > 0 ? 8 : 16 },
                ]}
              >
                {booking.isPaid ? "✅ Đã thanh toán" : "❌ Chưa thanh toán"}
              </Text>

              {booking.selectedDishes?.length > 0 && (
                <View>
                  <Text style={styles.dishesTitle}>🍽️ Món ăn đã chọn:</Text>
                  <View style={styles.dishesContainer}>
                    {booking.selectedDishes.map((dishItem, index) => (
                      <View key={index.toString()} style={styles.dishItem}>
                        <Image
                          source={{
                            uri:
                              dishItem.dishId?.image ||
                              "https://via.placeholder.com/100?text=No+Image",
                          }}
                          style={styles.dishImage}
                        />
                        <Text
                          style={styles.dishName}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {dishItem.dishId?.name || "Tên món"}
                        </Text>
                        <Text style={styles.dishQuantity}>
                          SL: {dishItem.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.totalAmount}>
                    Tổng tiền:{" "}
                    {(booking.totalAmount || 0).toLocaleString("vi-VN")} đ
                  </Text>

                  {!booking.isPaid && (
                    <TouchableOpacity
                      onPress={() => handleOpenPaymentModal(booking)}
                      style={styles.paymentButton}
                    >
                      <Text style={styles.buttonTextPayment}>Thanh toán</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.noBookingsContainer}>
          <Text style={styles.noBookingsText}>Chưa có lịch sử đặt bàn.</Text>
        </View>
      )}

      {isModalOpen && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onSave={handleSaveBooking}
        />
      )}

      {isPaymentModalOpen && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
    borderColor: "#e2e2e2",
    borderWidth: 1,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    flex: 1,
    marginRight: 8,
  },
  bookingText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  detailItemSpacing: {
    marginBottom: 6,
  },
  paidText: {
    color: "#10b981",
    fontWeight: "bold",
    fontSize: 14,
  },
  unpaidText: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  dishesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    marginTop: 8,
  },
  dishesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dishItem: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "48%",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    minHeight: 120,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  dishName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#374151",
    marginBottom: 4,
  },
  dishQuantity: {
    fontSize: 12,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "right",
  },
  paymentButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonTextPayment: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  noBookingsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noBookingsText: {
    fontSize: 18,
    textAlign: "center",
    color: "#6b7280",
    marginTop: 30,
  },
});

export default BookingHistory;
