import { useEffect, useState } from "react";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    FacebookFilled,
    YoutubeFilled,
    TikTokOutlined,
    LinkedinFilled,
    PinterestOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getCategoriesParentAPI, getCategoryChildrenAPI } from "@/services/api";
import "./app.footer.scss";
import { App } from "antd";

const AppFooter = () => {
    const [childCategories, setChildCategories] = useState<
        { _id: string; name: string }[]
    >([]);
    const navigate = useNavigate();

    // ===== LẤY TOÀN BỘ DANH MỤC CON =====
    useEffect(() => {
        const fetchAllChildren = async () => {
            try {
                const resParent = await getCategoriesParentAPI();
                if (resParent && resParent.data) {
                    const parents = resParent.data;
                    const childrenLists = await Promise.all(
                        parents.map(async (p: any) => {
                            const resChild = await getCategoryChildrenAPI(p._id);
                            return resChild?.data ?? [];
                        })
                    );
                    const flat = childrenLists.flat(); // gộp tất cả con lại
                    setChildCategories(flat);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh mục con:", err);
            }
        };
        fetchAllChildren();
    }, []);

    const handleClickChild = (id: string) => {
        navigate("/");
        setTimeout(() => {
            window.dispatchEvent(
                new CustomEvent("filterCategory", { detail: { id, deep: false } })
            );
        }, 200);
    };

    return (
        <footer className="footer">
            <div className="footer-top">
                {/* ====== CỘT 1: THÔNG TIN CÔNG TY ====== */}
                <div className="footer-col">
                    <h3>NHẠC CỤ TIẾN ĐẠT</h3>
                    <p className="footer-subtitle">
                        <EnvironmentOutlined /> <b>Trụ sở Hà Nội:</b>
                    </p>
                    <p>Số 85 Nguyễn Văn Huyên, Phường Quan Hoa, Cầu Giấy</p>
                    <p>
                        <PhoneOutlined /> Kinh doanh bán lẻ: 098.117.4788 - 090.321.6609 -
                        024.6663.9953
                    </p>
                    <p>
                        <PhoneOutlined /> Kinh doanh bán sỉ: 0904.82.1381
                    </p>
                    <br />
                    <p className="footer-subtitle">
                        <EnvironmentOutlined /> <b>Chi nhánh TP.HCM:</b>
                    </p>
                    <p>118 Điện Biên Phủ, Phường 17, Q. Bình Thạnh</p>
                    <p>
                        <PhoneOutlined /> Kinh doanh bán lẻ: 028.3505.0345 - 0938.770.002 -
                        0909.015.886
                    </p>
                    <p>
                        <PhoneOutlined /> Kinh doanh bán sỉ: 0904.831.381
                    </p>
                </div>

                {/* ====== CỘT 2: DANH MỤC CON ====== */}
                <div className="footer-col">
                    <h4>Danh mục sản phẩm</h4>
                    <ul className="child-only-list">
                        {childCategories.length > 0 ? (
                            childCategories.map((child) => (
                                <li
                                    key={child._id}
                                    onClick={() => handleClickChild(child._id)}
                                >
                                    {child.name}
                                </li>
                            ))
                        ) : (
                            <li>Đang tải danh mục...</li>
                        )}
                    </ul>
                </div>

                {/* ====== CỘT 3: CHÍNH SÁCH ====== */}
                <div className="footer-col">
                    <h4>Chính sách</h4>
                    <ul>
                        <li>Chính sách bán hàng & chất lượng</li>
                        <li>Chính sách bảo mật thông tin</li>
                        <li>Chính sách Đổi - Trả hàng hóa</li>
                        <li>Chính sách vận chuyển</li>
                        <li>Chính sách bảo hành</li>
                    </ul>
                </div>

                {/* ====== CỘT 4: TRỢ GIÚP + MẠNG XÃ HỘI ====== */}
                <div className="footer-col">
                    <h4>Trợ giúp nhanh</h4>
                    <ul>
                        <li>Hướng dẫn mua hàng</li>
                        <li>Hướng dẫn thanh toán</li>
                        <li>Khiếu nại & bồi thường</li>
                        <li>Liên hệ hỗ trợ</li>
                    </ul>

                    <div className="socials">
                        <FacebookFilled />
                        <YoutubeFilled />
                        <TikTokOutlined />
                        <LinkedinFilled />
                        <PinterestOutlined />
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    © 2025 Nhạc cụ Tiến Đạt - Công ty CP Thương mại & Dịch vụ Kỹ thuật
                    Thành Đạt
                </p>
                <p>Mã số kinh doanh: 0101516915. Cấp ngày 30/07/2004 tại Hà Nội.</p>
            </div>
        </footer>
    );
};

export default AppFooter;
