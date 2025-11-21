// src/pages/admin/AdminChatPage.tsx
import { useEffect, useState } from "react";
import { Card, Select, List, Input, Button, Badge } from "antd";
import {
    getChatConversationsAPI,
    getChatMessagesAPI,
    adminSendChatAPI,
} from "@/services/api";

const { TextArea } = Input;

const AdminChatPage = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    // ====== LOAD CONVERSATIONS ======
    const loadConversations = async () => {
        const res = await getChatConversationsAPI();
        setConversations(res.data || []);
    };

    // ====== LOAD MESSAGES ======
    const loadMessages = async (id?: string) => {
        const cid = id || selected;
        if (!cid) return;

        const res = await getChatMessagesAPI(cid);
        const list = res.data || [];

        setMessages(list.filter((m: any) => m.content !== "__init__"));
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selected) loadMessages(selected);
    }, [selected]);

    // AUTO REFRESH LIST + MESSAGES
    useEffect(() => {
        const timer = setInterval(() => {
            loadConversations();
            if (selected) loadMessages(selected);
        }, 2000);

        return () => clearInterval(timer);
    }, [selected]);

    // ADMIN GỬI TIN
    const send = async () => {
        console.log("DEBUG selected:", selected);
        console.log("DEBUG input:", input);

        if (!selected) {
            console.log("⛔ Không có conversationId -> không gọi API");
            return;
        }

        if (!input.trim()) return;

        const res = await adminSendChatAPI({
            conversationId: selected,
            content: input,
        });

        console.log("📩 Admin gửi thành công:", res.data);

        setInput("");

        await loadMessages(selected);
        await loadConversations();
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
                onChange={(v) => setSelected(v)}
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
