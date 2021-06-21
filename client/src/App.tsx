import React, { useState, useEffect, useContext } from "react";
import { Socket } from "socket.io-client";
import "./App.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import RoomList from "./components/RoomList";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { ISocketContext, SocketContext } from "./components/SocketContext";
import Messages from "./components/Messages";

export interface ISocketMessage {
  room: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface IRoom {
  roomId: string;
  roomName: string;
}
export interface IMessage {
  SK: string;
  PK: string;
  message: string;
  username: string;
  timestamp: number;
}
export interface IMessageList {
  roomId: string;
  messages: IMessage[];
}
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("undefined...");
  const [roomName, setRoomName] = useState("Lobby");
  const [chatData, setChatData] = useState([
    {
      SK: "#MESSAGE#rexx921621570384619",
      message: "Test hello dynamoooo",
      username: "rexx92",
      PK: "ROOM#Lobby",
      timestamp: 1621570384618
    },
    {
      SK: "#MESSAGE#rexx921621571157926",
      message: "Hi Tobi",
      username: "rexx92",
      PK: "ROOM#Lobby",
      timestamp: 1621571157923
    }
  ]);
  const [roomList, setRoomList] = useState<IRoom[]>([
    { roomName: "Lobby", roomId: "abcdef" },
    { roomName: "Sports", roomId: "1223" }
  ]);
  const [roomUserList, setRoomUserList] = useState<string[]>([
    "rexx92, tobi22"
  ]);
  const [color, setColor] = useState("#1362b0");

  const socket: ISocketContext = useContext(SocketContext);

  const [message, setMessage] = useState("");

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      socket.connectSocket(undefined, sessionId);
    }
  }, []);

  useEffect(() => {
    // Set up socket message handlers
    if (socket?.connection) {
      setIsConnected(true);

      socket.connection.on("session", ({ sessionId, username }) => {
        // Store session in localStorage
        onLogin(username);
        socket.connection.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
      });
      socket.connection.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.connection.on("message", (data: IMessage) => {
        setChatData((prev) => {
          const chatDataCopy = prev.slice();
          chatDataCopy.push(data);
          return chatDataCopy;
        });
      });

      socket.connection.on(
        "onlineUserUpdate",
        (data: { username: string; connected: boolean }[]) => {
          console.log("online user update", data);
        }
      );

      socket.connection.on("messageList", (data: IMessageList) => {
        console.log("🚀 ~ messageList", data);
        setChatData(data.messages);
      });
      socket.connection.on("roomListUpdate", (data: IRoom[]) => {
        console.log("🚀 ~ all public room list", data);

        setRoomList(data);
      });
      socket.connection.on("userRoomListUpdate", (data: IRoom[]) => {
        console.log("🚀 ~ rooms user is part of including DM's");

        setRoomList(data);
      });
      socket.connection.on("usersInRoom", (data: any) => {
        console.log("🚀 ~ Update list of users for current room", data);
      });
    }

    return () => {
      if (socket?.connection) {
        socket.connection.offAny();
      }
      setIsConnected(false);
    };
  }, [socket, socket?.connection]);

  const sendMessage = () => {
    socket.connection.emit("message", {
      room: roomName,
      username,
      message,
      timestamp: Date.now()
    });
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleRoomChange = (event: any) => {
    setRoomName(event.target.textContent);
    setChatData([]);
    socket.connection.emit("joinRoom", { roomId: event.target.textContent });
  };

  const onLogin = (username: string) => setUsername(username);

  const logout = () => {
    localStorage.clear();
    socket.disconnectSocket();
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        {!isConnected && (
          <>
            <SignUp />
            <Login onLogin={onLogin} />
          </>
        )}
        {isConnected && (
          <>
            <RoomList
              roomList={roomList}
              onChangeRoom={handleRoomChange}
              selectedRoom={roomName}
            />
            <Messages messages={chatData} />
            <input value={message} onChange={onMessageChange} />
            <button onClick={sendMessage}>Send</button>
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
