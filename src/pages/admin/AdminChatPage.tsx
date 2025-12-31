import { useEffect, useState, useRef } from "react";
import { Card, Select, List, Input, Button, Badge } from "antd";
import {
    getChatConversationsAPI,
    getChatMessagesAPI,
    adminSendChatAPI,
} from "@/services/api";
import { io } from "socket.io-client";

const { TextArea } = Input;

const AdminChatPage = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    const socketRef = useRef<any>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // LOAD conversations
    const loadConversations = async () => {
        const res = await getChatConversationsAPI();
        setConversations(res.data || []);
    };

    // LOAD messages
    const loadMessages = async (cid?: string) => {
        const id = cid || selected;
        if (!id) return;

        const res = await getChatMessagesAPI(id);
        const list = res.data || [];

        // FULL HISTORY: giữ nguyên USER + ADMIN
        setMessages(list);
    };

    // LOAD list on first time
    useEffect(() => {
        loadConversations();
    }, []);

    // LOAD message when selected changes
    useEffect(() => {
        if (selected) loadMessages(selected);
    }, [selected]);

    // SOCKET real-time
    useEffect(() => {
        if (!socketRef.current)
            socketRef.current = io(import.meta.env.VITE_BACKEND_URL);

        const socket = socketRef.current;

        socket.on("new_message", (msg: any) => {
            // Nếu là đúng cuộc trò chuyện đang mở
            if (msg.conversationId === selected) {
                setMessages((prev) => [...prev, msg]);
            }

            // Luôn update danh sách conversation
            loadConversations();
        });

        return () => socket.off("new_message");
    }, [selected]);

    // AUTO SCROLL
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    // SEND
    const send = async () => {
        if (!selected || !input.trim()) return;

        await adminSendChatAPI({
            conversationId: selected,
            content: input,
        });

        setInput("");
        // không loadMessages ngay – socket sẽ tự thêm msg
    };

    return (
        <Card title="Quản lý Chat hỗ trợ">
            <Select
                placeholder="Chọn khách hàng"
                style={{ width: 350, marginBottom: 20 }}
                value={selected || undefined}
                options={conversations.map((c: any) => ({
                    value: c._id,
                    label: (
                        <span>
                            {c.customerName
                                ? `${c.customerName} (${c.customerEmail || ""})`
                                : c.sessionId}
                            {c.hasUnread && (
                                <Badge status="error" style={{ marginLeft: 8 }} />
                            )}
                        </span>
                    ),
                }))}
                onChange={(v) => {
                    setSelected(v);
                    loadMessages(v);
                }}
                allowClear
            />

            <div
                ref={listRef}
                style={{
                    height: 400,
                    overflowY: "auto",
                    marginBottom: 20,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: "8px 12px",
                }}
            >
                <List
                    dataSource={messages}
                    renderItem={(m: any) => (
                        <List.Item
                            style={{
                                border: "none",
                                padding: "4px 0",
                                justifyContent:
                                    m.sender === "ADMIN" ? "flex-end" : "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    maxWidth: "70%",
                                    background:
                                        m.sender === "ADMIN" ? "#1677ff" : "#eee",
                                    color: m.sender === "ADMIN" ? "white" : "black",
                                }}
                            >
                                {m.content}
                            </div>
                        </List.Item>
                    )}
                />
            </div>

            <TextArea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập nội dung trả lời..."
                onPressEnter={(e) => {
                    if (!e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
            />

            <Button type="primary" onClick={send} style={{ marginTop: 10 }}>
                Gửi phản hồi
            </Button>
        </Card>
    );
};

export default AdminChatPage;
