import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import "./utilities/theme.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import RoomList from "./components/RoomList";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AppContext } from "./components/AppContext";
import Messages from "./components/Messages";
import Input from "./components/Input";
import UserList from "./components/UserList";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [color, setColor] = useState("#1362b0");

  const { socket, connectSocket, disconnectSocket } = useContext(AppContext);

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      connectSocket(undefined, sessionId);
    }
  }, []);

  useEffect(() => {
    // Set up socket message handlers
    if (socket) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [socket]);

  const logout = () => {
    localStorage.clear();
    disconnectSocket();
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        {!isConnected && (
          <>
            <SignUp />
            <Login />
          </>
        )}
        {isConnected && (
          <>
            <UserList />
            <RoomList />
            <Messages />
            <Input />
            <button onClick={logout}>Logout</button>
            <SketchPad color={color} />
            <ColorPicker color={color} setColor={setColor} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
