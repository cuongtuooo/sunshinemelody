import { getOrdersAPI, updateOrderStatusAPI } from '@/services/api';
import { dateRangeValidate } from '@/services/helper';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Tag } from 'antd';
import { useRef, useState } from 'react';

type TSearch = {
    name: string;
    createdAt: string;
    createdAtRange: string;
};

const statusLabels: Record<string, string> = {
    pending: "Chờ xác nhận",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    completed: "Hoàn tất",
    canceled: "Đã hủy",
    "returned-request": "Khách yêu cầu hoàn hàng",
    "returned-completed": "Đã nhận hàng hoàn"
};

const statusColors: Record<string, string> = {
    pending: "gold",
    shipping: "blue",
    delivered: "cyan",
    completed: "green",
    canceled: "red",
    "returned-request": "orange",
    "returned-completed": "purple"
};

const TableOrder = () => {
    const actionRef = useRef<ActionType>();
    const { message } = App.useApp();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    // ================= CẬP NHẬT TRẠNG THÁI ====================
    const handleUpdateStatus = async (record: IOrderTable, nextStatus: string) => {
        const res = await updateOrderStatusAPI(record._id, nextStatus);
        if (res.data) {
            message.success("Cập nhật trạng thái thành công!");
            actionRef?.current?.reload(); // reload lại bảng
        } else {
            message.error("Cập nhật thất bại!");
        }
    };

    const columns: ProColumns<IOrderTable>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48
        },
        {
            title: 'ID',
            dataIndex: '_id',
            hideInSearch: true
        },
        {
            title: 'Tên khách',
            dataIndex: 'name'
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address'
        },
        {
            title: 'Giá tiền',
            dataIndex: 'totalPrice',
            hideInSearch: true,
            sorter: true,
            render: (_, entity) =>
                new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(entity.totalPrice)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            hideInSearch: true,
            render: (_, record) => (
                <Tag color={statusColors[record.status]}>
                    {statusLabels[record.status]}
                </Tag>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true
        },

        // ================= CỘT HÀNH ĐỘNG CỦA ADMIN ====================
        {
            title: 'Hành động',
            valueType: 'option',
            width: 200,
            render: (_, record) => {
                const s = record.status;

                // pending → admin xác nhận để giao hàng
                if (s === "pending") {
                    return (
                        <Popconfirm
                            title="Xác nhận giao hàng?"
                            onConfirm={() => handleUpdateStatus(record, "shipping")}
                        >
                            <Button type="primary">Xác nhận & Giao hàng</Button>
                        </Popconfirm>
                    );
                }

                // shipping → admin đã giao hàng
                if (s === "shipping") {
                    return (
                        <Popconfirm
                            title="Đánh dấu là Đã giao hàng?"
                            onConfirm={() => handleUpdateStatus(record, "delivered")}
                        >
                            <Button type="primary">Đã giao hàng</Button>
                        </Popconfirm>
                    );
                }

                // returned-request → admin nhận lại hàng hoàn
                if (s === "returned-request") {
                    return (
                        <Popconfirm
                            title="Xác nhận đã nhận hàng hoàn?"
                            onConfirm={() => handleUpdateStatus(record, "returned-completed")}
                        >
                            <Button danger>Đã nhận hàng hoàn</Button>
                        </Popconfirm>
                    );
                }

                // delivered, completed, canceled, returned-completed → không có nút
                return <i>Không có hành động</i>;
            }
        }
    ];

    return (
        <ProTable<IOrderTable, TSearch>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (params, sort, filter) => {
                let query = `current=${params.current}&pageSize=${params.pageSize}`;

                if (params.name) {
                    query += `&name=/${params.name}/i`;
                }

                const createDateRange = dateRangeValidate(params.createdAtRange);
                if (createDateRange) {
                    query += `&createdAt>=${createDateRange[0]}&createdAt<=${createDateRange[1]}`;
                }

                if (sort && sort.createdAt) {
                    query += `&sort=${sort.createdAt === "ascend" ? "createdAt" : "-createdAt"}`;
                } else {
                    query += `&sort=-createdAt`;
                }

                const res = await getOrdersAPI(query);
                if (res.data) {
                    setMeta(res.data.meta);
                }

                return {
                    data: res.data?.result,
                    page: 1,
                    success: true,
                    total: res.data?.meta.total
                };
            }}
            rowKey="_id"
            pagination={{
                current: meta.current,
                pageSize: meta.pageSize,
                showSizeChanger: true,
                total: meta.total,
                showTotal: (total, range) => (
                    <div>{range[0]}-{range[1]} trên {total} rows</div>
                )
            }}
            headerTitle="Quản lý đơn hàng"
        />
    );
};

export default TableOrder;
