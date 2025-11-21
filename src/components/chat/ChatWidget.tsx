import { useEffect, useState, useRef } from "react";
import { Drawer, Button, Input, List } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import {
    userSendChatAPI,
    getChatMessagesAPI,
    getChatConversationsAPI,
} from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";
import { io } from "socket.io-client";

const ChatWidget = () => {
    const { user } = useCurrentApp();

    const [open, setOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string>("");
    const [conversationId, setConversationId] = useState<string>("");
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    const socketRef = useRef<any>(null);

    // ============ TẠO SESSION ID ============
    useEffect(() => {
        let sid = "";

        if (user?._id) {
            const key = `chat_session_${user._id}`;
            sid = localStorage.getItem(key) || `user_${user._id}`;
            localStorage.setItem(key, sid);
        } else {
            const key = "chat_session_guest";
            sid = localStorage.getItem(key) || `guest_${Date.now()}`;
            localStorage.setItem(key, sid);
        }

        setSessionId(sid);
    }, [user?._id]);

    // ============ INIT CONVERSATION ============
    const initConversation = async () => {
        if (!sessionId) return;

        // gửi "__init__" để backend tạo conversation
        await userSendChatAPI(
            sessionId,
            "__init__",
            user?.name,
            user?.email,
            user?._id
        );

        const res = await getChatConversationsAPI();
        const list = res.data || [];

        const convo = list.find((c: any) => c.sessionId === sessionId);

        if (convo) {
            setConversationId(convo._id);
            await loadMessages(convo._id);
        }
    };

    // ============ LOAD MESSAGES ============
    const loadMessages = async (cid?: string) => {
        const id = cid || conversationId;
        if (!id) return;

        const res = await getChatMessagesAPI(id);
        const list = res.data || [];

        setMessages(list.filter((m: any) => m.content !== "__init__"));
    };

    // INIT ngay khi đã có session
    useEffect(() => {
        if (sessionId && !conversationId) initConversation();
    }, [sessionId]);

    // ============ SOCKET REAL-TIME ============

    useEffect(() => {
        if (!conversationId) return;

        // Chỉ tạo socket 1 lần
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
        }

        const socket = socketRef.current;

        socket.on("new_message", (msg: any) => {
            if (msg.conversationId === conversationId) {
                // real-time push
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            if (socket) socket.off("new_message");
        };
    }, [conversationId]);

    // USER GỬI TIN
    const send = async () => {
        if (!input.trim()) return;

        await userSendChatAPI(
            sessionId,
            input,
            user?.name,
            user?.email,
            user?._id
        );

        setInput("");
    };

    // TỰ CUỘN XUỐNG DÒNG CUỐI
    const listRef = useRef<any>(null);
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<MessageOutlined />}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    zIndex: 9999,
                }}
                onClick={() => setOpen(true)}
            />

            <Drawer
                title="Hỗ trợ khách hàng"
                open={open}
                onClose={() => setOpen(false)}
                width={360}
            >
                <div ref={listRef} style={{ height: "70vh", overflowY: "auto" }}>
                    <List
                        dataSource={messages}
                        renderItem={(item: any) => (
                            <List.Item
                                style={{
                                    border: "none",
                                    padding: "4px 0",
                                    justifyContent:
                                        item.sender === "USER"
                                            ? "flex-end"
                                            : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        background:
                                            item.sender === "USER"
                                                ? "#1677ff"
                                                : "#eee",
                                        color:
                                            item.sender === "USER"
                                                ? "white"
                                                : "black",
                                        padding: "8px 12px",
                                        borderRadius: 10,
                                        maxWidth: "75%",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {item.content}
                                </div>
                            </List.Item>
                        )}
                    />
                </div>

                <Input.TextArea
                    rows={2}
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                    }}
                />

                <Button type="primary" block style={{ marginTop: 8 }} onClick={send}>
                    Gửi
                </Button>
            </Drawer>
        </>
    );
};

export default ChatWidget;
