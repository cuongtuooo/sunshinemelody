import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import CountUp from "react-countup";
import {
    getDashboardAPI,
    getOrdersAPI,
    getProductsAPI,
    getCategoriesAPI
} from "@/services/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>({
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        lowStock: 0,
        totalCategoryParent: 0,
        totalCategoryChildren: 0,
    });

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    const formatter = (value: any) => <CountUp end={value} separator="," />;

    useEffect(() => {
        const fetchDashboard = async () => {
            const res = await getDashboardAPI();
            const dashboard = res?.data || {};

            // Sản phẩm sắp hết hàng
            const lowStockAPI = await getProductsAPI("quantity<=5&quantity>0&pageSize=999");
            const lowStockCount = lowStockAPI?.data?.result?.length || 0;

            // Danh mục
            const categoriesAPI = await getCategoriesAPI("pageSize=999");
            const catList = categoriesAPI?.data?.result || [];
            const parents = catList.filter((c: any) => !c.parent);
            const children = catList.filter((c: any) => c.parent);

            // Đơn hàng gần đây
            const recentOrderAPI = await getOrdersAPI("sort=-createdAt&pageSize=5");
            setRecentOrders(recentOrderAPI?.data?.result || []);

            // 🔥 Top 10 sản phẩm bán chạy
            const topAPI = await getProductsAPI("sort=-sold&pageSize=10");
            const topList = topAPI?.data?.result || [];

            // Lấy danh mục cha + con từ category trong product
            const topListMapped = topList.map((p: any) => {
                let parentName = "";
                let childName = "";

                // Nếu category có ancestors nghĩa là có cha/con
                if (p.category?.ancestors?.length > 0) {
                    const ancestors = p.category.ancestors;
                    parentName = catList.find((c: any) => c._id === ancestors[0])?.name || "";
                    childName = p.category?.name || "";
                } else {
                    // Không có cha → chính nó là cha
                    parentName = p.category?.name || "";
                    childName = "—";
                }

                return {
                    ...p,
                    parentName,
                    childName,
                };
            });

            setTopProducts(topListMapped);

            setStats({
                totalOrders: dashboard.totalOrders || 0,
                totalProducts: dashboard.totalProducts || 0,
                totalRevenue: dashboard.totalRevenue || 0,
                lowStock: lowStockCount,
                totalCategoryParent: parents.length,
                totalCategoryChildren: children.length,
            });
        };

        fetchDashboard();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            {/* ==== DÒNG 1: THỐNG KÊ TỔNG QUAN ==== */}
            <Row gutter={[20, 20]}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Tổng Đơn hàng" value={stats.totalOrders} formatter={formatter} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Tổng Sản phẩm" value={stats.totalProducts} formatter={formatter} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Doanh thu (VNĐ)"
                            value={stats.totalRevenue}
                            formatter={formatter}
                        />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Sắp hết hàng (≤5)" value={stats.lowStock} formatter={formatter} />
                    </Card>
                </Col>
            </Row>

            {/* ==== DÒNG 2: DANH MỤC ==== */}
            <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Danh mục CHA" value={stats.totalCategoryParent} formatter={formatter} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Danh mục CON" value={stats.totalCategoryChildren} formatter={formatter} />
                    </Card>
                </Col>
            </Row>

            {/* ==== BẢNG TOP SẢN PHẨM BÁN CHẠY ==== */}
            <div style={{ marginTop: 40 }}>
                <h2>🔥 Top 10 sản phẩm bán chạy</h2>

                <Table
                    dataSource={topProducts}
                    rowKey="_id"
                    pagination={false}
                    columns={[
                        { title: "Tên sản phẩm", dataIndex: "name" },
                        {
                            title: "Giá",
                            dataIndex: "price",
                            render: (v) => new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND"
                            }).format(v)
                        },
                        { title: "Đã bán", dataIndex: "sold" },
                        // { title: "Danh mục CHA", dataIndex: "parentName" },
                        // { title: "Danh mục CON", dataIndex: "childName" },
                    ]}
                />
            </div>

            {/* ==== ĐƠN HÀNG GẦN ĐÂY ==== */}
            <div style={{ marginTop: 40 }}>
                <h2>📦 Đơn hàng gần đây</h2>

                <Table
                    dataSource={recentOrders}
                    rowKey="_id"
                    pagination={false}
                    columns={[
                        { title: "Tên khách", dataIndex: "name" },
                        { title: "Số điện thoại", dataIndex: "phone" },
                        {
                            title: "Tổng tiền",
                            dataIndex: "totalPrice",
                            render: (value) =>
                                new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                }).format(value)
                        },
                        {
                            title: "Trạng thái",
                            dataIndex: "status",
                            render: (status) => {
                                const color: any = {
                                    pending: "orange",
                                    shipping: "blue",
                                    delivered: "green",
                                    completed: "purple",
                                    canceled: "red",
                                };
                                return <Tag color={color[status]}>{status}</Tag>;
                            },
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
