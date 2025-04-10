import React, { useContext } from 'react';


export class Ws {
    socket: WebSocket | null = null;

    constructor(url: string) {
        this.socket = new WebSocket(url);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.initListeners();
    }

    reconnect() {
        this.socket?.close();
        this.socket = new WebSocket('ws://localhost:8080/api/ws');
        this.socket.onmessage = (event) => {
            this.handleMessage(event.data);
            console.log("message", event)
        };
    }

    handleMessage(data: any) {
        const message = JSON.parse(data.data);
        // console.log("message", message)
        switch (message.type) {
            case 'private message':
                console.log("received message", message)
                const eventName = `privateMessage-${message.sender}`;
                console.log("eventName", eventName)
                const pEvent = new CustomEvent(eventName, { detail: { message } });
                document.dispatchEvent(pEvent);
                break;
            case 'groupe':
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
        return this.socket;
    }
}

export const WebSocketContext = React.createContext<Ws | null>(null);

export function useWebSocket() {
    return useContext(WebSocketContext);
}