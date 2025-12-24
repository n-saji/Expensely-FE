import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/slices/notificationSlice";

export const useWebSocket = (userID: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userID) return;

    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?uuid=${userID}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(addNotification(data));
    };
    socket.onclose = () => console.log("WebSocket disconnected");
    socket.onerror = (err) => console.error("WebSocket error", err);

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [userID, dispatch]);
};
