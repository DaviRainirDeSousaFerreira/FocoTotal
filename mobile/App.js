import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <>
      <StatusBar style="light" />

      {!token ? (
        <LoginScreen onLoginSuccess={setToken} />
      ) : (
        <HomeScreen token={token} />
      )}
    </>
  );
}
