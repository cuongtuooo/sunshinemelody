import { useEffect, useState } from "react";
import { App, Divider, Drawer, Space, Table, Tag, Button } from 'antd';
import type { TableProps } from 'antd';
import dayjs from "dayjs";
import { FORMATE_DATE_VN } from "@/services/helper";
import {
    getHistoryAPI,
    updateOrderStatusAPI,
    cancelOrderAPI
} from "@/services/api";

const statusColors: Record<string, string> = {
    pending: "gold",
    shipping: "blue",
    delivered: "cyan",
    completed: "green",
    canceled: "red",
    "returned-request": "orange",
    "returned-completed": "purple"
};

const statusLabels: Record<string, string> = {
    pending: "Chờ xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn tất",
    canceled: "Đã hủy",
    "returned-request": "Đang hoàn hàng",
    "returned-completed": "Đã nhận hàng hoàn"
};

const HistoryPage = () => {
    const [dataHistory, setDataHistory] = useState<IHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [openDetail, setOpenDetail] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<IHistory | null>(null);

    const { notification, message } = App.useApp();

    const fetchData = async () => {
        setLoading(true);
        const res = await getHistoryAPI();
        if (res && res.data) {
            setDataHistory(res.data);
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ---------------- HANDLE ACTIONS ----------------

    const handleCancelOrder = async (id: string) => {
        const res = await cancelOrderAPI(id);
        if (res.data) {
            message.success("Hủy đơn hàng thành công");
            fetchData();
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        const res = await updateOrderStatusAPI(id, status);
        if (res.data) {
            message.success("Cập nhật trạng thái thành công");
            fetchData();
        }
    };

    // ---------------- TABLE COLUMNS ----------------
    const columns: TableProps<IHistory>['columns'] = [
        {
            title: 'STT',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            render: (time) => dayjs(time).format(FORMATE_DATE_VN)
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            render: (money) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(money)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: string) => (
                <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>
            )
        },
        {
            title: 'Hành động',
            render: (_, record) => {
                const s = record.status;

                return (
                    <Space direction="vertical">
                        {/* Chi tiết */}
                        <a
                            onClick={() => {
                                setOpenDetail(true);
                                setDataDetail(record);
                            }}
                        >
                            Xem chi tiết
                        </a>

                        {/* pending → có thể hủy */}
                        {s === "pending" && (
                            <Button danger onClick={() => handleCancelOrder(record._id)}>
                                Hủy đơn
                            </Button>
                        )}

                        {/* delivered → Có 2 nút */}
                        {s === "delivered" && (
                            <Space>
                                <Button
                                    type="primary"
                                    onClick={() => handleUpdateStatus(record._id, "completed")}
                                >
                                    Đã nhận hàng
                                </Button>

                                <Button
                                    onClick={() => handleUpdateStatus(record._id, "returned-request")}
                                >
                                    Hoàn hàng
                                </Button>
                            </Space>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ margin: 50 }}>
            <h3>Lịch sử mua hàng / Theo dõi đơn hàng</h3>
            <Divider />

            <Table
                bordered
                columns={columns}
                dataSource={dataHistory}
                rowKey="_id"
                loading={loading}
            />

            <Drawer
                title="Chi tiết đơn hàng"
                onClose={() => {
                    setOpenDetail(false);
                    setDataDetail(null);
                }}
                open={openDetail}
                width={400}
            >
                {dataDetail?.detail?.map((item, index) => (
                    <ul key={index}>
                        <li><b>Sản phẩm:</b> {item.productName}</li>
                        <li><b>Số lượng:</b> {item.quantity}</li>
                        <Divider />
                    </ul>
                ))}
            </Drawer>
        </div>
    );
};

export default HistoryPage;
