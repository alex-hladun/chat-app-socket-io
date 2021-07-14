import React, { useReducer, createContext, useState } from "react";
import {
  DispatchEvent,
  IMessage,
  IRoom,
  IUsersInRoom,
  IMessageList
} from "../utilities/interfaces";
import socketIOClient, { Socket } from "socket.io-client";
import { reducer } from "./Reducer";
import { prefix } from "../config/constants";

const AppContext = createContext(null);
export const initialState = {
  username: "",
  rooms: {},
  currentRoomId: "",
  privateMessages: {},
  privateRoomJoined: false,
  onlineUsers: [],
  allUsers: []
};
const AppProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [socket, setSocket] = useState<Socket>(null);

  const connectSocket = (username?, sessionId?) => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient(`${prefix}`, {
            withCredentials: true,
            auth: { username, sessionId }
          })
        : socketIOClient(process.env.REACT_APP_SOCKET_CONNECTION, {
            withCredentials: true,
            auth: { username, sessionId }
          });

    if (socketConnection) {
      setSocket(socketConnection);
      socketConnection.emit("joinRoom", { roomId: "1" });

      socketConnection.on("session", ({ sessionId, username }) => {
        // Store session in localStorage
        dispatch({ type: DispatchEvent.SetUsername, data: username });
        dispatch({
          type: DispatchEvent.JoinRoomId,
          data: { roomId: "1", private: false }
        });
        socketConnection.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
      });

      socketConnection.on("message", (data: IMessage) => {
        dispatch({ type: DispatchEvent.AddMessage, data });
      });

      socketConnection.on(
        "onlineUserUpdate",
        (data: { username: string; connected: boolean }[]) => {
          dispatch({
            type: DispatchEvent.SetOnlineUsers,
            data: data.map((user) => user.username)
          });
        }
      );

      socketConnection.on("messageList", (data: IMessageList) => {
        dispatch({
          type: DispatchEvent.SetInitialChatData,
          data
        });
      });
      socketConnection.on("privateMessageList", (data: IMessageList) => {
        dispatch({
          type: DispatchEvent.SetInitalPrivateMessageData,
          data
        });
      });
      socketConnection.on("roomListUpdate", (data: IRoom[]) => {
        dispatch({
          type: DispatchEvent.SetPublicRoomList,
          data
        });
      });
      socketConnection.on("allUserUpdate", (data: any) => {
        dispatch({
          type: DispatchEvent.UserListUpdate,
          data
        });
      });
      socketConnection.on("usersInRoom", (data: IUsersInRoom) => {
        dispatch({
          type: DispatchEvent.SetUsersInRoom,
          data
        });
      });
      socketConnection.on("privateMessageCreation", (roomId: string) => {
        socketConnection.emit("joinPrivateMessage", roomId);
      });

      // Log all socket items
      socketConnection.onAny((data, params) =>
        console.log("🚀 SOCKET:", data, params)
      );
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      localStorage.clear();
      setSocket(null);
    }
  };

  return (
    <AppContext.Provider
      value={{ state, dispatch, socket, connectSocket, disconnectSocket }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
