import { useEffect, useState } from "react";
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
    const socket = io(import.meta.env.VITE_BACKEND_URL);

    const loadConversations = async () => {
        const res = await getChatConversationsAPI();
        setConversations(res.data || []);
    };

    const loadMessages = async (id?: string) => {
        const cid = id || selected;
        if (!cid) return;

        const res = await getChatMessagesAPI(cid);
        setMessages((res.data || []).filter((m: any) => m.content !== "__init__"));
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selected) loadMessages(selected);
    }, [selected]);

    // REAL-TIME SOCKET (chỉ tạo 1 lần)
    useEffect(() => {
        socket.on("new_message", (msg: any) => {
            if (msg.conversationId === selected) {
                setMessages(prev => [...prev, msg]); // real-time push
            }
            loadConversations();
        });
        return () => socket.disconnect();
    }, [selected]);

    // ADMIN GỬI TIN
    const send = async () => {
        if (!selected || !input.trim()) return;

        await adminSendChatAPI({
            conversationId: selected,
            content: input,
        });

        setInput("");
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
                    if (!v) {
                        setSelected("");
                        setMessages([]);
                        return;
                    }
                    setSelected(v);
                    loadMessages(v);
                }}
                allowClear
            />

            <div
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
