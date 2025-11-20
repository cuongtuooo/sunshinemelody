import { Row, Col, Rate, Divider, App, Breadcrumb } from 'antd';
import ImageGallery from 'react-image-gallery';
import { useEffect, useRef, useState } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import 'styles/product.scss';
import ModalGallery from './modal.gallery';
import { useCurrentApp } from '@/components/context/app.context';
import { Link, useNavigate } from 'react-router-dom';
import './product.detail.scss'
import DOMPurify from 'dompurify';
import { useMemo } from 'react'; 
import { createReviewAPI, getReviewByProductAPI } from '@/services/api';
import { Input, Button, List, Avatar } from 'antd';
interface IProps {
    currentProduct: IProductTable | null;
}

type UserAction = "MINUS" | "PLUS"

const ProductDetail = (props: IProps) => {
    const { currentProduct } = props;
    // Sanitize trước khi hiển thị
    const safeMainText = useMemo(
        () => DOMPurify.sanitize(currentProduct?.mainText ?? ''),
        [currentProduct]
    );
    const safeDesc = useMemo(
        () => DOMPurify.sanitize(currentProduct?.desc ?? ''),
        [currentProduct]
    );
    const [imageGallery, setImageGallery] = useState<{
        original: string;
        thumbnail: string;
        originalClass: string;
        thumbnailClass: string;
    }[]>([])

    const [isOpenModalGallery, setIsOpenModalGallery] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const refGallery = useRef<ImageGallery>(null);
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);

    const { setCarts, user } = useCurrentApp();
    const { message } = App.useApp();
    
    const navigate = useNavigate();

    // ============ REVIEW ============  
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewContent, setReviewContent] = useState<string>("");
    const [rating, setRating] = useState<number>(5)
    // const images = [
    //     {
    //         original: 'https://picsum.photos/id/1018/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1018/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1015/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1015/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1019/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1019/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1018/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1018/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1015/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1015/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1019/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1019/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1018/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1018/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1015/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1015/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    //     {
    //         original: 'https://picsum.photos/id/1019/1000/600/',
    //         thumbnail: 'https://picsum.photos/id/1019/250/150/',
    //         originalClass: "original-image",
    //         thumbnailClass: "thumbnail-image"
    //     },
    // ];

    useEffect(() => {
        if (currentProduct) {
            //build images 
            const images = [];
            if (currentProduct.thumbnail) {
                images.push(
                    {
                        original: `${import.meta.env.VITE_BACKEND_URL}/images/product/${currentProduct.thumbnail}`,
                        thumbnail: `${import.meta.env.VITE_BACKEND_URL}/images/product/${currentProduct.thumbnail}`,
                        originalClass: "original-image",
                        thumbnailClass: "thumbnail-image"
                    },
                )
            }
            if (currentProduct.slider) {
                currentProduct.slider?.map(item => {
                    images.push(
                        {
                            original: `${import.meta.env.VITE_BACKEND_URL}/images/product/${item}`,
                            thumbnail: `${import.meta.env.VITE_BACKEND_URL}/images/product/${item}`,
                            originalClass: "original-image",
                            thumbnailClass: "thumbnail-image"
                        },
                    )
                })
            }
            setImageGallery(images)
        }
    }, [currentProduct])

    useEffect(() => {
        if (currentProduct?._id) {
            getReviewByProductAPI(currentProduct._id).then(res => {
                if (res && res.data) {
                    setReviews(res.data);
                }
            });
        }
    }, [currentProduct]);

    const handleOnClickImage = () => {
        //get current index onClick
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery?.current?.getCurrentIndex() ?? 0)
    }

    const handleChangeButton = (type: UserAction) => {
        if (type === 'MINUS') {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }
        if (type === 'PLUS' && currentProduct) {
            if (currentQuantity === +currentProduct.quantity) return; //max
            setCurrentQuantity(currentQuantity + 1);
        }
    }

    const handleChangeInput = (value: string) => {
        if (!isNaN(+value)) {
            if (+value > 0 && currentProduct && +value < +currentProduct.quantity) {
                setCurrentQuantity(+value);
            }
        }
    }

    const handleAddToCart = (isBuyNow = false) => {
        if (!user) {
            message.error("Bạn cần đăng nhập để thực hiện tính năng này.")
            return;
        }
        //update localStorage
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage && currentProduct) {
            //update
            const carts = JSON.parse(cartStorage) as ICart[];

            //check exist
            let isExistIndex = carts.findIndex(c => c._id === currentProduct?._id);
            if (isExistIndex > -1) {
                carts[isExistIndex].quantity =
                    carts[isExistIndex].quantity + currentQuantity;
            } else {
                carts.push({
                    quantity: currentQuantity,
                    _id: currentProduct._id,
                    detail: currentProduct
                })
            }

            localStorage.setItem("carts", JSON.stringify(carts));

            //sync React Context
            setCarts(carts);
        } else {
            //create
            const data = [{
                _id: currentProduct?._id!,
                quantity: currentQuantity,
                detail: currentProduct!
            }]
            localStorage.setItem("carts", JSON.stringify(data))

            //sync React Context
            setCarts(data);
        }

        if (isBuyNow) {
            navigate("/order")
        } else
            message.success("Thêm sản phẩm vào giỏ hàng thành công.")
    }

    const handleSubmitReview = async () => {
        if (!user) {
            message.error("Bạn cần đăng nhập để đánh giá.");
            return;
        }
        if (!reviewContent.trim()) {
            message.error("Nội dung đánh giá không được để trống.");
            return;
        }

        const res = await createReviewAPI(
            currentProduct!._id,
            reviewContent,
            rating
        );

        if (res && res.data) {
            message.success("Đã gửi đánh giá!");
            setReviews(prev => [
                {
                    content: reviewContent,
                    rating,
                    createdAt: new Date(),
                    userInfo: {
                        email: user.email
                    }
                },
                ...prev
            ]);
            setReviewContent("");
            setRating(5);
        }
    };

    return (
        <div style={{ background: '#efefef', padding: "20px 0" }}>
            <div className='view-detail-Product' style={{ maxWidth: 1440, margin: '0 auto' }}>

                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to={"/"}>Trang Chủ</Link> },
                        { title: 'Xem chi tiết sản phẩm' },
                    ]}
                />

                {/* ================== ROW 1 → Ảnh + Thông tin ================== */}
                <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                    <Row gutter={[20, 20]}>

                        {/* ẢNH BÊN TRÁI */}
                        <Col md={10} sm={24} xs={24}>
                            <ImageGallery
                                ref={refGallery}
                                items={imageGallery}
                                showPlayButton={false}
                                showFullscreenButton={false}
                                renderLeftNav={() => <></>}
                                renderRightNav={() => <></>}
                                slideOnThumbnailOver={true}
                                onClick={() => handleOnClickImage()}
                            />
                        </Col>

                        {/* THÔNG TIN SẢN PHẨM BÊN PHẢI */}
                        <Col md={14} sm={24}>
                            <div className='title'>
                                <strong>Tên sản phẩm:</strong> {currentProduct?.name}
                            </div>

                            <div className='price'>
                                <span className='currency'>
                                    {
                                        new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(currentProduct?.price ?? 0)
                                    }
                                </span>
                            </div>

                            <div className='delivery'>
                                <div>
                                    <span className='left'>Vận chuyển</span>
                                    <span className='right'>Miễn phí vận chuyển</span>
                                </div>
                            </div>

                            <div className='quantity'>
                                <span className='left'>Số lượng</span>
                                <span className='right'>
                                    <button onClick={() => handleChangeButton('MINUS')}><MinusOutlined /></button>
                                    <input onChange={(e) => handleChangeInput(e.target.value)} value={currentQuantity} />
                                    <button onClick={() => handleChangeButton('PLUS')}><PlusOutlined /></button>
                                </span>
                            </div>

                            <div className='buy'>
                                <button className='cart' onClick={() => handleAddToCart()}>
                                    <BsCartPlus className='icon-cart' />
                                    <span>Thêm vào giỏ hàng</span>
                                </button>
                                <button className='now' onClick={() => handleAddToCart(true)}>Mua ngay</button>
                            </div>

                        </Col>
                    </Row>
                </div>

                {/* ================== ROW 2 → NỘI DUNG SẢN PHẨM ================== */}
                <div style={{ marginTop: 20, background: "#fff", padding: 20, borderRadius: 5 }}>
                    <h3>Nội dung sản phẩm</h3>
                    <Divider />

                    <div className="html-content" dangerouslySetInnerHTML={{ __html: safeMainText }} />

                    <h3 style={{ marginTop: 30 }}>Mô tả chi tiết sản phẩm</h3>
                    <Divider />

                    <div className="html-content" dangerouslySetInnerHTML={{ __html: safeDesc }} />
                </div>

                {/* ================== REVIEW ================== */}
                <div style={{ marginTop: 30, background: "#fff", padding: 20, borderRadius: 5 }}>
                    <h3>Đánh giá sản phẩm</h3>
                    <Divider />

                    {/* FORM ĐÁNH GIÁ */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ marginBottom: 10 }}>
                            <strong>Chọn số sao:</strong>
                            <br />
                            <Rate value={rating} onChange={setRating} />
                        </div>

                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập nội dung đánh giá..."
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                        />

                        <Button
                            type="primary"
                            style={{ marginTop: 10 }}
                            onClick={() => {
                                if (!user) {
                                    message.error("Bạn cần đăng nhập để đánh giá sản phẩm.");
                                    return;
                                }
                                handleSubmitReview();
                            }}
                        >
                            Gửi đánh giá
                        </Button>
                    </div>


                    <Divider />

                    {/* DANH SÁCH ĐÁNH GIÁ */}
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
                                            <div>
                                                <Rate disabled value={item.rating} />
                                            </div>
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


                {/* MODAL */}
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

}

export default ProductDetail;
