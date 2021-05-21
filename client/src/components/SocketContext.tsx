import React, { createContext, useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
require("dotenv").config({ path: "./.env" });

const SocketContext = createContext(null);

const SocketProvider = (props: any) => {
  const [socket, setSocket] = useState<Socket>(null);

  useEffect(() => {
    const socketConnection =
      process.env.REACT_APP_ENV === "dev"
        ? socketIOClient("localhost:3001")
        : socketIOClient();
    console.log(
      process.env.REACT_APP_ENV === "dev"
        ? "connecting to localhost:3001"
        : "connecting to server..."
    );
    if (socketConnection) {
      setSocket(socketConnection);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };