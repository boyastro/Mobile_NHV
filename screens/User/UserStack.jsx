// screens/User/UserStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserDashboard from "./UserDashboard";
import BookUser from "./BookUsers";
import BookingHistory from "./BookingHistory";
import UserProfile from "./UserProfile";

const Stack = createNativeStackNavigator();

const UserStack = ({ setIsLoggedIn, setRole }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserDashboard">
        {(props) => (
          <UserDashboard
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setRole={setRole}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="BookUser" component={BookUser} />
      <Stack.Screen name="BookingHistory" component={BookingHistory} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
};

export default UserStack;
