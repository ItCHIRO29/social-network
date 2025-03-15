"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WebSocketContext } from "./WebSocketContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ws || ws?.readyState === WebSocket.CLOSED || ws?.readyState === WebSocket.CLOSING) {
      const ws = new WebSocket("ws://localhost:8080/api/ws");
      setWs(ws);
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
