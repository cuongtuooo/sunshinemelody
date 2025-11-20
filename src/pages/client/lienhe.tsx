import React from "react";

const ContactInfo: React.FC = () => {
    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", lineHeight: 1.7 }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px", textAlign: "center" }}>
                Thông Tin Liên Hệ – Nhạc Cụ Tiến Đạt / THADACO
            </h1>

            {/* Trụ sở Hà Nội */}
            <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "10px", color: "#d32f2f" }}>
                    Trụ Sở Chính – Hà Nội
                </h2>
                <p><strong>Công ty Cổ phần Thương mại và Dịch vụ Kỹ thuật THÀNH ĐẠT (THADACO)</strong></p>
                <p>
                    <strong>Địa chỉ:</strong> 85A Nguyễn Văn Huyên kéo dài, cạnh Nhà Văn Hóa phường Quan Hoa,
                    Quận Cầu Giấy, Thành phố Hà Nội.
                </p>
                <p><strong>Website:</strong> nhaccutiendat.vn</p>
                <p><strong>Email:</strong> thanhdat@thadaco.vn</p>

                <p><strong>Điện thoại:</strong></p>
                <ul style={{ paddingLeft: "20px" }}>
                    <li>098.117.4788</li>
                    <li>090.321.6609</li>
                    <li>024.6663.9953</li>
                </ul>

                <p><strong>SĐT bán buôn:</strong> 0904.82.1381</p>
            </section>

            {/* Chi nhánh HCM */}
            <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "10px", color: "#d32f2f" }}>
                    Chi Nhánh TP. Hồ Chí Minh
                </h2>
                <p>
                    <strong>Địa chỉ:</strong> 140 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP.HCM.
                </p>

                <p><strong>Điện thoại:</strong></p>
                <ul style={{ paddingLeft: "20px" }}>
                    <li>02835 144 875</li>
                    <li>028.6286.5908</li>
                    <li>0966.688.169</li>
                    <li>Fax: 0966.688.169</li>
                </ul>

                <p><strong>SĐT bán buôn:</strong> 09456.11011</p>
            </section>

            {/* Miền Trung */}
            <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "10px", color: "#d32f2f" }}>
                    Khu Vực Miền Trung
                </h2>
                <p>
                    <strong>Địa chỉ:</strong> Tầng 1, tòa nhà chung cư Lũng Lô, đường Hồ Xuân Hương,
                    phường Vinh Tân, TP. Vinh, tỉnh Nghệ An (sau bến xe chợ Vinh)
                </p>
                <p><strong>Điện thoại:</strong> 0983.081.345</p>
            </section>

            {/* Giờ làm việc */}
            <section>
                <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "10px", color: "#d32f2f" }}>
                    Thời Gian Làm Việc
                </h2>
                <p>Thứ 2 → Thứ 7: <strong>8:00 – 18:00</strong></p>
                <p>Chủ nhật nghỉ (hoặc hỗ trợ khi có hẹn trước).</p>
            </section>
        </div>
    );
};

export default ContactInfo;
