import { useEffect } from "react";
import { io } from "socket.io-client";

export const useChatSocket = (conversationId: string, onNewMessage: () => void) => {
    useEffect(() => {
        if (!conversationId) return;

        const socket = io(import.meta.env.VITE_BACKEND_URL);

        socket.on("new_message", (msg) => {
            if (msg.conversationId === conversationId) {
                onNewMessage();
            }
        });

        return () => socket.disconnect();
    }, [conversationId]);
};
