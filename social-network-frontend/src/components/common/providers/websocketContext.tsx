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
        const url = process.env.NEXT_PUBLIC_WS_URL || "";
        this.socket = new WebSocket(url);
        this.socket.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }

    handleMessage(data: any) {
        const message = JSON.parse(data);
        console.log("message", message)
        switch (message.type) {
            case 'private message':
                console.log("received message", message)
                const eventName = `privateMessage-${message.sender}`;
                console.log("eventName", eventName)
                const pEvent = new CustomEvent(eventName, { detail: { message } });
                document.dispatchEvent(pEvent);
                break;
            case 'group message':
                const gEvent = new CustomEvent('groupMessage', { detail: message });
                document.dispatchEvent(gEvent);
                break;
            case 'status':
                const sEvent = new CustomEvent(`status`, { detail: message });
                document.dispatchEvent(sEvent);
            case 'notification':
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