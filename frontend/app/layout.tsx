"use client";
import "./globals.css";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WebSocketContext, Ws } from "./WebSocketContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [ws, setWs] = useState<Ws | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ws) {
      const ws = new Ws("ws://localhost:8080/api/ws");
      setWs(ws);
    }else if (!ws?.socket || ws?.socket?.readyState === WebSocket.CLOSED || ws?.socket?.readyState === WebSocket.CLOSING) {
      ws?.reconnect();
    }
  }, [router]);
  return (
    <html lang="en">
      <body>
        <WebSocketContext.Provider value={ws}>
        {children}
        </WebSocketContext.Provider>
      </body>
    </html>
  );
}
