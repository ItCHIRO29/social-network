import React, { useContext } from 'react';


export class Ws {
    socket: WebSocket | null = null;

    constructor() {
        this.socket = null;
        this.initListeners();
    }

    reconnect() {
        if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }
        this.socket?.close();
        const url = process.env.NEXT_PUBLIC_WS_URL;
        if (!url) {
            throw new Error("WebSocket URL is not configured. Please set NEXT_PUBLIC_WS_URL environment variable.");
        }
        this.socket = new WebSocket(url);
        this.socket.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }

    handleMessage(data: string) {
        const message = JSON.parse(data);
        console.log("messageeeeeeeeeeeeeeeeeeeeeeeee", message)
        switch (message.type) {
            case 'private message':
                const eventName = `privateMessage-${message.sender}`;
                const pEvent = new CustomEvent(eventName, { detail: { message } });
                document.dispatchEvent(pEvent);
                break;
            case 'groupe':
                const customgrp = `groupMessage-${message.receiver}`;
                const gEvent = new CustomEvent(customgrp, { detail: message });
                document.dispatchEvent(gEvent);
                break;
            case 'status':
                const sEvent = new CustomEvent(`status`, { detail: message });
                document.dispatchEvent(sEvent);
                break;
            case 'notification':
                message.type = message.notification_type;
                const nEvent = new CustomEvent('notification', { detail: message });
                document.dispatchEvent(nEvent);
                break;
            case 'error':
                const eEvent = new CustomEvent('error', { detail: message });
                document.dispatchEvent(eEvent);
                break;
        }
    }

    initListeners() {
        document.addEventListener('sendMessage', (event: Event) => {
            if (event instanceof CustomEvent) {
                console.log("recieved message event");
                const message = event.detail;
                this.socket?.send(JSON.stringify(message));
            }
        });


    }

    getSocket() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN && this.socket.readyState !== WebSocket.CONNECTING) {
            this.reconnect();
        }
        return this.socket;
    }
}

export const WebSocketContext = React.createContext<Ws | null>(null);

export function useWebSocket() {
    return useContext(WebSocketContext);
}