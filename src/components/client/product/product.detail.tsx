// ======================= IMPORT =======================
import { Row, Col, Rate, Divider, App, Breadcrumb, Input, Button, List, Avatar } from 'antd';
import ImageGallery from 'react-image-gallery';
import { useEffect, useRef, useState, useMemo } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import ModalGallery from './modal.gallery';
import { useCurrentApp } from '@/components/context/app.context';
import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
    createReviewAPI,
    getRelatedProductsAPI,
    getReviewByProductAPI
} from '@/services/api';

import 'styles/product.scss';
import './product.detail.scss';

interface IProps {
    currentProduct: IProductTable | null;
}

type UserAction = "MINUS" | "PLUS";

// ========================================================
//                   MAIN COMPONENT
// ========================================================

const ProductDetail = (props: IProps) => {
    const { currentProduct } = props;

    const safeMainText = useMemo(
        () => DOMPurify.sanitize(currentProduct?.mainText ?? ''),
        [currentProduct]
    );
    const safeDesc = useMemo(
        () => DOMPurify.sanitize(currentProduct?.desc ?? ''),
        [currentProduct]
    );

    const [imageGallery, setImageGallery] = useState<any[]>([]);
    const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const refGallery = useRef<ImageGallery>(null);
    const [currentQuantity, setCurrentQuantity] = useState(1);

    const { setCarts, user } = useCurrentApp();
    const { message } = App.useApp();
    const navigate = useNavigate();

    // ===================== REVIEW ===========================
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewContent, setReviewContent] = useState("");
    const [rating, setRating] = useState(5);

    // ===================== RELATED PRODUCTS ==================
    const [relatedProducts, setRelatedProducts] = useState<IProductTable[]>([]);

    useEffect(() => {
        if (!currentProduct?._id) return;

        getRelatedProductsAPI(currentProduct._id).then(res => {
            if (res?.data) setRelatedProducts(res.data);
        });
    }, [currentProduct]);

    // ===================== GALLERY ===========================
    useEffect(() => {
        if (!currentProduct) return;

        const imgs: any[] = [];

        if (currentProduct.thumbnail) {
            imgs.push({
                original: `${import.meta.env.VITE_BACKEND_URL}/images/product/${currentProduct.thumbnail}`,
                thumbnail: `${import.meta.env.VITE_BACKEND_URL}/images/product/${currentProduct.thumbnail}`,
                originalClass: "original-image",
                thumbnailClass: "thumbnail-image"
            });
        }

        currentProduct.slider?.forEach(img => {
            imgs.push({
                original: `${import.meta.env.VITE_BACKEND_URL}/images/product/${img}`,
                thumbnail: `${import.meta.env.VITE_BACKEND_URL}/images/product/${img}`,
                originalClass: "original-image",
                thumbnailClass: "thumbnail-image"
            });
        });

        setImageGallery(imgs);
    }, [currentProduct]);

    // ===================== GET REVIEWS =========================
    useEffect(() => {
        if (!currentProduct?._id) return;

        getReviewByProductAPI(currentProduct._id).then(res => {
            if (res?.data) setReviews(res.data);
        });
    }, [currentProduct]);

    // ===================== IMAGE MODAL =========================
    const handleOnClickImage = () => {
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery.current?.getCurrentIndex() ?? 0);
    };

    // ===================== QUANTITY CONTROL =====================
    const handleChangeButton = (type: UserAction) => {
        if (!currentProduct) return;

        if (type === "MINUS" && currentQuantity > 1) {
            setCurrentQuantity(qty => qty - 1);
        }
        if (type === "PLUS" && currentQuantity < currentProduct.quantity) {
            setCurrentQuantity(qty => qty + 1);
        }
    };

    const handleChangeInput = (value: string) => {
        if (!currentProduct) return;
        const num = Number(value);
        if (isNaN(num)) return;

        if (num <= 0) setCurrentQuantity(1);
        else if (num > currentProduct.quantity) setCurrentQuantity(currentProduct.quantity);
        else setCurrentQuantity(num);
    };

    // ===================== ADD TO CART ==========================
    const handleAddToCart = (isBuyNow = false) => {
        if (!user) {
            message.error("Bạn cần đăng nhập.");
            return;
        }
        if (!currentProduct) return;

        const maxQty = Number(currentProduct.quantity);
        const cartStorage = localStorage.getItem("carts");

        if (cartStorage) {
            const carts = JSON.parse(cartStorage);
            const index = carts.findIndex(c => c._id === currentProduct._id);

            if (index > -1) {
                const newQty = carts[index].quantity + currentQuantity;
                if (newQty > maxQty) return message.error(`Chỉ còn ${maxQty} sản phẩm.`);
                carts[index].quantity = newQty;
            } else {
                if (currentQuantity > maxQty) return message.error(`Chỉ còn ${maxQty} sản phẩm.`);
                carts.push({ _id: currentProduct._id, quantity: currentQuantity, detail: currentProduct });
            }

            localStorage.setItem("carts", JSON.stringify(carts));
            setCarts(carts);
        } else {
            if (currentQuantity > maxQty) return message.error(`Chỉ còn ${maxQty} sản phẩm.`);
            const data = [{ _id: currentProduct._id, quantity: currentQuantity, detail: currentProduct }];
            localStorage.setItem("carts", JSON.stringify(data));
            setCarts(data);
        }

        isBuyNow ? navigate("/order") : message.success("Đã thêm giỏ hàng");
    };

    // ===================== SUBMIT REVIEW ===========================
    const handleSubmitReview = async () => {
        if (!user) return message.error("Bạn cần đăng nhập.");
        if (!reviewContent.trim()) return message.error("Nội dung không được trống.");

        const res = await createReviewAPI(currentProduct!._id, reviewContent, rating);

        if (res?.data) {
            message.success("Đã gửi đánh giá!");
            setReviews(prev => [
                {
                    content: reviewContent,
                    rating,
                    createdAt: new Date(),
                    userInfo: { email: user.email }
                },
                ...prev
            ]);

            setReviewContent("");
            setRating(5);
        }
    };

    // ===================== ANTI-DRAG CLICK FIX =======================
    const [isDragging, setIsDragging] = useState(false);

    // ===================== SLIDER SETTINGS ============================
    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 1200,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        cssEase: "linear",
        autoplaySpeed: 1500,
        swipeToSlide: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } }
        ]
    };

    // ========================================================
    return (
        <div style={{ background: "#efefef", padding: "20px 0" }}>
            <div className="view-detail-Product" style={{ maxWidth: 1440, margin: "0 auto" }}>

                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/">Trang Chủ</Link> },
                        { title: "Xem chi tiết sản phẩm" }
                    ]}
                />

                {/* ======================== ẢNH + INFO ========================== */}
                <div style={{ padding: 20, background: "#fff", borderRadius: 5 }}>
                    <Row gutter={[20, 20]}>
                        <Col md={10} xs={24}>
                            <ImageGallery
                                ref={refGallery}
                                items={imageGallery}
                                showPlayButton={false}
                                showFullscreenButton={false}
                                renderLeftNav={() => <></>}
                                renderRightNav={() => <></>}
                                onClick={handleOnClickImage}
                            />
                        </Col>

                        <Col md={14} xs={24}>
                            <div className="title">
                                <strong>Tên sản phẩm:</strong> {currentProduct?.name}
                            </div>

                            <div className="price">
                                <span className="currency">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND"
                                    }).format(currentProduct?.price ?? 0)}
                                </span>
                            </div>

                            <div className="delivery">
                                <div>
                                    <span className="left">Vận chuyển</span>
                                    <span className="right">Miễn phí vận chuyển</span>
                                </div>
                            </div>

                            <div className="quantity">
                                <span className="left">Số lượng</span>
                                <span className="right">
                                    <button onClick={() => handleChangeButton("MINUS")}><MinusOutlined /></button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={currentProduct?.quantity}
                                        value={currentQuantity}
                                        onChange={(e) => handleChangeInput(e.target.value)}
                                    />
                                    <button onClick={() => handleChangeButton("PLUS")}><PlusOutlined /></button>
                                </span>
                            </div>

                            <div className="buy">
                                <button className="cart" onClick={() => handleAddToCart()}>
                                    <BsCartPlus className="icon-cart" />
                                    <span>Thêm vào giỏ hàng</span>
                                </button>
                                <button className="now" onClick={() => handleAddToCart(true)}>Mua ngay</button>
                            </div>
                            {/* === SOCIAL BUTTONS === */}
                            <div className="social-buttons">
                                <a
                                    className="social-btn call"
                                    href="tel:0987654321"
                                >
                                    📞 Gọi ngay
                                </a>

                                <a
                                    className="social-btn zalo"
                                    href="https://zalo.me/0987654321"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    💬 Zalo
                                </a>

                                <a
                                    className="social-btn fb"
                                    href="https://www.facebook.com/yourpage"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    🔵 Facebook
                                </a>
                            </div>
                            
                            {/* ======================== SẢN PHẨM LIÊN QUAN ========================= */}
                            {relatedProducts.length > 0 && (
                                <div style={{ marginTop: 30, background: "#fff", padding: 20, borderRadius: 5 }}>
                                    <h3>Sản phẩm liên quan</h3>
                                    <Divider />

                                    <Slider {...sliderSettings}>
                                        {relatedProducts.map(item => (
                                            <div className="related-slider" key={item._id}>
                                                <div
                                                    className="item"
                                                    onMouseDown={() => setIsDragging(false)}
                                                    onMouseMove={() => setIsDragging(true)}
                                                    onMouseUp={() => {
                                                        if (!isDragging) navigate(`/Product/${item._id}`);
                                                    }}
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.thumbnail}`}
                                                        alt={item.name}
                                                    />

                                                    <div className="name">{item.name}</div>

                                                    <div className="price">
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND"
                                                        }).format(item.price)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>

                

                {/* ======================== MAIN CONTENT ========================= */}
                <div style={{ marginTop: 20, background: "#fff", padding: 20, borderRadius: 5 }}>
                    <h3>Nội dung sản phẩm</h3>
                    <Divider />
                    <div className="html-content" dangerouslySetInnerHTML={{ __html: safeMainText }} />

                    <h3 style={{ marginTop: 30 }}>Mô tả chi tiết sản phẩm</h3>
                    <Divider />
                    <div className="html-content" dangerouslySetInnerHTML={{ __html: safeDesc }} />
                </div>

                {/* ======================== REVIEW ========================= */}
                <div style={{ marginTop: 30, background: "#fff", padding: 20, borderRadius: 5 }}>
                    <h3>Đánh giá sản phẩm</h3>
                    <Divider />

                    <div style={{ marginBottom: 20 }}>
                        <strong>Chọn số sao:</strong>
                        <Rate value={rating} onChange={setRating} />

                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập nội dung đánh giá..."
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                        />

                        <Button type="primary" style={{ marginTop: 10 }} onClick={handleSubmitReview}>
                            Gửi đánh giá
                        </Button>
                    </div>

                    <Divider />

                    <List
                        itemLayout="horizontal"
                        dataSource={reviews}
                        locale={{ emptyText: "Chưa có đánh giá nào" }}
                        renderItem={(item: any) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar>{item.userInfo?.email.charAt(0).toUpperCase()}</Avatar>}
                                    title={
                                        <div>
                                            <strong>{item.userInfo?.email}</strong>
                                            <Rate disabled value={item.rating} />
                                        </div>
                                    }
                                    description={
                                        <>
                                            <div>{item.content}</div>
                                            <div style={{ fontSize: 12, color: "gray" }}>
                                                {new Date(item.createdAt).toLocaleString("vi-VN")}
                                            </div>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>

                {/* ================= MODAL GALLERY ================= */}
                <ModalGallery
                    isOpen={isOpenModalGallery}
                    setIsOpen={setIsOpenModalGallery}
                    currentIndex={currentIndex}
                    items={imageGallery}
                    title={currentProduct?.mainText ?? ""}
                />
            </div>
        </div>
    );
};

export default ProductDetail;
