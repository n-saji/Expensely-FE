import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/slices/notificationSlice";

export const useWebSocket = (userID: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const isManuallyClosedRef = useRef(false);

  useEffect(() => {
    if (!userID) {
      return;
    }

    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsBaseUrl) {
      console.error("Missing NEXT_PUBLIC_WS_URL. WebSocket was not started.");
      return;
    }

    isManuallyClosedRef.current = false;
    const heartbeatIntervalMs = Number(
      process.env.NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL_MS ?? 25000,
    );
    const reconnectDelayMs = Number(
      process.env.NEXT_PUBLIC_WS_RECONNECT_DELAY_MS ?? 3000,
    );
    const heartbeatPayload =
      process.env.NEXT_PUBLIC_WS_HEARTBEAT_PAYLOAD ??
      JSON.stringify({ type: "ping" });

    const clearHeartbeat = () => {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const clearReconnect = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const startHeartbeat = (socket: WebSocket) => {
      clearHeartbeat();
      heartbeatTimerRef.current = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(heartbeatPayload);
        }
      }, heartbeatIntervalMs);
    };

    const connect = () => {
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const socket = new WebSocket(
        `${wsBaseUrl}?uuid=${encodeURIComponent(userID)}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        clearReconnect();
        startHeartbeat(socket);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data?.type === "ping" || data?.type === "pong") {
            return;
          }

          dispatch(addNotification(data));
        } catch (e) {
          console.error("Invalid WS message", e);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error", err);
      };

      socket.onclose = () => {
        clearHeartbeat();
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (!isManuallyClosedRef.current) {
          reconnectTimerRef.current = window.setTimeout(() => {
            connect();
          }, reconnectDelayMs);
        }
      };
    };

    connect();

    return () => {
      isManuallyClosedRef.current = true;
      clearHeartbeat();
      clearReconnect();

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        socketRef.current.close(1000, "WebSocket cleanup");
      }
      socketRef.current = null;
    };
  }, [userID, dispatch]);
};
