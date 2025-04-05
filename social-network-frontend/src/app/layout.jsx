'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header/header";
import { ChatManager } from "@/components/common/chat/ChatManager";
import { useEffect, useState } from "react";
import { usePathname , useRouter} from "next/navigation";
import { WebSocketContext, Ws } from "@/components/common/providers/websocketContext";
import { UserDataProvider } from "../components/common/providers/userDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [ws, setWs] = useState(null);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const router = useRouter();
  
  useEffect(() => {
    if (!ws) {
      const ws = new Ws();
      setWs(ws.getSocket());
      return;
    }
    setWs(ws.getSocket());
  }, [router]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <WebSocketContext.Provider value={ws}>
          <UserDataProvider>
            {!isAuthPage && <Header /> }
            <main className={isAuthPage ? "auth-page" : "main-layout"}>
              {!isAuthPage && (
                <aside className="chat-sidebar">
                  <ChatManager />
                </aside>
              )}
              <div className={isAuthPage ? "full-content" : "main-content"}>
                {children}
              </div>
            </main>
          </UserDataProvider>
        </WebSocketContext.Provider>
      </body>
    </html>
  );
}