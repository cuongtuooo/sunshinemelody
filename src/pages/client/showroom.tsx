import React from "react";

const sectionStyle: React.CSSProperties = {
    marginBottom: "40px",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const titleStyle: React.CSSProperties = {
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "15px",
    color: "#d10000"
};

const subTitle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "10px"
};

const textStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "10px"
};

const imageStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "10px",
    margin: "10px 0"
};

const Showroom = () => {
    return (
        <div style={{ background: "#f5f5f5", padding: "40px 0" }}>
            <div style={{ width: "90%", maxWidth: "1100px", margin: "0 auto" }}>

                {/* =============================
                    GIỚI THIỆU CHUỖI SHOWROOM
                ============================== */}
                <section style={sectionStyle}>
                    <h1 style={titleStyle}>Nhạc cụ Tiến Đạt – Giới thiệu Showroom nhạc cụ</h1>

                    <p style={textStyle}>
                        Thành lập từ năm 2004, Nhạc cụ Tiến Đạt được biết đến là một trong những nhà phân phối nhạc cụ uy tín tại Hà Nội và TPHCM.
                        Kể từ năm 2013, Tiến Đạt chính thức trở thành Đại lý số 1 của Yamaha Việt Nam và nhận được rất nhiều giải thưởng
                        dành cho đại lý bán hàng xuất sắc nhất.
                    </p>

                    <p style={textStyle}>
                        Tại Việt Nam, Showroom đầu tiên khai trương tháng 07/2004. Hiện tại Tiến Đạt có 2 Showroom lớn tại TP. Hồ Chí Minh
                        và 2 Showroom tại Hà Nội. Chúng tôi tiếp tục mở rộng chuỗi showroom để phục vụ khách hàng tốt hơn.
                    </p>

                    <p style={textStyle}>Dưới đây là hình ảnh và thông tin các Showroom Tiến Đạt:</p>
                </section>

                {/* =============================
                    SHOWROOM 1 – HÀ NỘI
                ============================== */}
                <section style={sectionStyle}>
                    <h2 style={subTitle}>1. Showroom đầu tiên – Hà Nội</h2>

                    <p style={textStyle}>
                        Địa chỉ cũ: 71 Quan Hoa – Phường Quan Hoa – Cầu Giấy – Hà Nội.
                    </p>
                    <p style={textStyle}>
                        <strong>Từ 15/03/2024 chuyển sang địa chỉ mới:</strong><br />
                        85 Nguyễn Văn Huyên, Quan Hoa, Cầu Giấy (Cạnh nhà văn hóa phường Quan Hoa)
                    </p>
                    <p style={textStyle}>Điện thoại: 0283.505.0345 – 0904 831 381</p>

                    {/* =============================
                        ẢNH SHOWROOM HÀ NỘI
                    ============================== */}
                    <img style={imageStyle} src="/images/showroom-hn-1.jpg" alt="Nhạc cụ Tiến Đạt Hà Nội" />
                    <img style={imageStyle} src="/images/showroom-hn-2.jpg" alt="Nhạc cụ Tiến Đạt Hà Nội" />
                    <img style={imageStyle} src="/images/showroom-hn-3.jpg" alt="Showroom nhạc cụ Tiến Đạt" />
                    <img style={imageStyle} src="/images/showroom-hn-4.jpg" alt="Showroom nhạc cụ Tiến Đạt" />
                </section>

                {/* =============================
                    SHOWROOM 2 – TP.HCM
                ============================== */}
                <section style={sectionStyle}>
                    <h2 style={subTitle}>2. Showroom thứ 2 – TP. Hồ Chí Minh</h2>

                    <p style={textStyle}>
                        Địa chỉ cũ: 91 Điện Biên Phủ, P.15, Bình Thạnh (Ngã Tư Hàng Xanh)
                    </p>

                    <p style={textStyle}>
                        <strong>Từ tháng 05/2019 chuyển sang địa chỉ mới:</strong><br />
                        118 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP. Hồ Chí Minh
                    </p>

                    <p style={textStyle}>Điện thoại: 0283.505.0345 – 0904 831 381</p>

                    {/* =============================
                        ẢNH SHOWROOM TPHCM
                    ============================== */}
                    <img style={imageStyle} src="/images/showroom-hcm-1.jpg" alt="Nhạc cụ Tiến Đạt TPHCM" />
                    <img style={imageStyle} src="/images/showroom-hcm-2.jpg" alt="Showroom Tiến Đạt HCM" />
                    <img style={imageStyle} src="/images/showroom-hcm-3.jpg" alt="Showroom Tiến Đạt HCM" />
                </section>

                {/* =============================
                    SẢN PHẨM CHÍNH
                ============================== */}
                <section style={sectionStyle}>
                    <h2 style={subTitle}>3. Các sản phẩm chính tại Nhạc cụ Tiến Đạt</h2>

                    <ul style={{ marginLeft: "20px", lineHeight: "1.7", fontSize: "16px" }}>
                        <li>Đàn Piano: Yamaha, Casio, Roland, Kawai</li>
                        <li>Đàn Organ: Casio, Roland, Yamaha, Kawai</li>
                        <li>Đàn Guitar: Yamaha, Cordoba, Taylor, Takamine…</li>
                        <li>Đàn violin</li>
                        <li>Kèn Harmonica, Melodion</li>
                        <li>Trống Jazz, trống điện tử, trống Cajon</li>
                        <li>Thiết bị âm thanh: Loa, amply, mixer, tai nghe, effect</li>
                        <li>Phụ kiện nhạc cụ các loại</li>
                    </ul>
                </section>

                {/* =============================
                    ĐỘI NGŨ NHÂN SỰ
                ============================== */}
                <section style={sectionStyle}>
                    <h2 style={subTitle}>4. Đội ngũ nhân viên tại Nhạc cụ Tiến Đạt</h2>

                    <p style={textStyle}>
                        Tiến Đạt luôn coi trọng trình độ & kinh nghiệm của đội ngũ nhân viên.
                        Sự nhiệt tình, thân thiện và trách nhiệm giúp thương hiệu phát triển vững mạnh.
                    </p>

                    <p style={textStyle}>
                        Đội ngũ nhân viên được đào tạo bài bản, có chuyên môn cao, sẵn sàng hỗ trợ kỹ thuật – tư vấn sản phẩm.
                        Đây là yếu tố quan trọng giúp Tiến Đạt luôn đáp ứng các yêu cầu cao nhất từ khách hàng.
                    </p>

                    <p style={textStyle}>
                        Với Ban lãnh đạo có tầm nhìn chiến lược, toàn thể nhân viên Tiến Đạt đang nỗ lực xây dựng thương hiệu
                        NHẠC CỤ CHÍNH HÃNG – GIÁ TỐT NHẤT tại Việt Nam.
                    </p>

                    <img style={imageStyle} src="/images/staff-hcm.jpg" alt="Nhân viên Nhạc cụ Tiến Đạt TPHCM" />
                    <img style={imageStyle} src="/images/staff-hn.jpg" alt="Nhân viên Nhạc cụ Tiến Đạt Hà Nội" />
                </section>

                {/* =============================
                    LIÊN HỆ
                ============================== */}
                <section style={sectionStyle}>
                    <h2 style={subTitle}>Liên hệ & Phản hồi</h2>

                    <p style={textStyle}>
                        Nhạc cụ Tiến Đạt rất vui khi nhận được thông tin phản hồi để phục vụ khách hàng tốt hơn.<br />
                        Website: https://nhaccutiendat.vn/ <br />
                        Facebook: https://www.facebook.com/nhaccutiendat
                    </p>

                    <p style={{ ...textStyle, fontWeight: 700, textAlign: "center", marginTop: "20px" }}>
                        Cám ơn các bạn đã tin tưởng và ủng hộ!
                    </p>
                </section>

            </div>
        </div>
    );
};

export default Showroom;
