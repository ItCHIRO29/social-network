import React, { useContext } from 'react';

export const WebSocketContext = React.createContext<WebSocket | null>(null);

export function useWebSocket() {
    return useContext(WebSocketContext);
}