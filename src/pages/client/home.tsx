import MobileFilter from '@/components/client/product/mobile.filter';
import {
    getProductsAPI,
    getCategoriesParentAPI,
    getCategoryChildrenAPI,
    getProductsByParentDeepAPI,
} from '@/services/api';
import {
    FilterTwoTone,
    ReloadOutlined,
    AppstoreOutlined,
    CustomerServiceOutlined,
    ReadOutlined,
    GiftOutlined,
    ProjectOutlined,
    SoundOutlined,
} from '@ant-design/icons';
import {
    Row, Col, Form, Divider, InputNumber,
    Button, Rate, Tabs, Pagination, Spin, Input
} from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import 'styles/home.scss';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type FieldType = { range: { from: number; to: number }; category: string[] };

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useOutletContext() as any;


    // ===== CATEGORIES =====
    const [listCategory, setListCategory] = useState<{ label: string, value: string }[]>([]);
    const [activeParentId, setActiveParentId] = useState<string | null>(null);
    const [childrenByParent, setChildrenByParent] = useState<Record<string, ICategory[]>>({});
    const [hoveringMenu, setHoveringMenu] = useState(false);

    // ===== PRODUCT LIST =====
    const [listProduct, setListProduct] = useState<IProductTable[]>([]);
    const [current, setCurrent] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [sortQuery, setSortQuery] = useState<string>("sort=-sold");
    const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [includeDescendants, setIncludeDescendants] = useState<boolean>(false);

    // ===== HOME SECTIONS =====
    const [sectionLoading, setSectionLoading] = useState<boolean>(false);
    const [parentProducts, setParentProducts] = useState<Record<string, IProductTable[]>>({});

    const [form] = Form.useForm();
    const navigate = useNavigate();

    // ---------- INIT ROOT CATEGORIES ----------
    useEffect(() => {
        const initCategory = async () => {
            const res = await getCategoriesParentAPI();
            if (res && res.data) {
                const d = res.data.map(item => ({ label: item.name, value: item._id }));
                setListCategory(d);
                preloadSections(d);
            }
        };
        initCategory();
    }, []);

    // ====== LẮNG NGHE SỰ KIỆN TỪ HEADER ======
    useEffect(() => {
        const handleFilter = (e: any) => {
            const { id, deep } = e.detail;
            setSelectedCategory(id);
            setIncludeDescendants(deep);
            setCurrent(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        window.addEventListener('filterCategory', handleFilter);
        return () => window.removeEventListener('filterCategory', handleFilter);
    }, []);

    useEffect(() => {
        const handler = (e: any) => {
            setCurrent(1);
            setSelectedCategory(null);
            setIncludeDescendants(false);
            setSearchTerm(e.detail); // <<--- thêm dòng này
        };

        window.addEventListener("doSearch", handler);
        return () => window.removeEventListener("doSearch", handler);
    }, []);

    // ---------- PRELOAD SECTIONS ----------
    const preloadSections = async (parents: { label: string; value: string }[]) => {
        setSectionLoading(true);
        try {
            const entries = await Promise.all(
                parents.map(async (p) => {
                    const res = await getProductsByParentDeepAPI(p.value, 1, 8, "sort=-sold");
                    const items = res?.data?.result ?? [];
                    return [p.value, items] as const;
                })
            );
            setParentProducts(Object.fromEntries(entries));
        } finally {
            setSectionLoading(false);
        }
    };

    // ---------- FETCH PRODUCT ----------
    useEffect(() => {
        if (selectedCategory || filter || searchTerm) {
            fetchProduct();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, pageSize, filter, sortQuery, searchTerm, selectedCategory, includeDescendants]);

    const fetchProduct = async () => {
        setIsLoading(true);
        let query = `current=${current}&pageSize=${pageSize}`;
        if (selectedCategory) {
            query += `&category=${selectedCategory}`;
            if (includeDescendants) query += `&deep=true`;
        }
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        if (searchTerm) {
            query += `&mainText=/${encodeURIComponent(searchTerm)}/i`;
        }

        

        const res = await getProductsAPI(query);
        if (res && res.data) {
            setListProduct(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination?.current !== current) setCurrent(pagination.current);
        if (pagination?.pageSize !== pageSize) { setPageSize(pagination.pageSize); setCurrent(1); }
    };

    // ---------- ICON GUESS ----------
    const guessIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("guitar")) return <SoundOutlined />;
        if (n.includes("piano")) return <AppstoreOutlined />;
        if (n.includes("organ")) return <AppstoreOutlined />;
        if (n.includes("violin")) return <SoundOutlined />;
        if (n.includes("loa") || n.includes("tai nghe")) return <CustomerServiceOutlined />;
        if (n.includes("tin") || n.includes("news")) return <ReadOutlined />;
        if (n.includes("khuyến") || n.includes("sale")) return <GiftOutlined />;
        if (n.includes("dự án")) return <ProjectOutlined />;
        return <AppstoreOutlined />;
    };

    const handleHoverParent = async (parentId: string) => {
        setActiveParentId(parentId);
        setHoveringMenu(true);
        if (!childrenByParent[parentId]) {
            const res = await getCategoryChildrenAPI(parentId);
            const arr = res?.data ?? [];
            setChildrenByParent(prev => ({ ...prev, [parentId]: arr }));
        }
    };

    const handleClickParent = (parentId: string) => {
        setSelectedCategory(parentId);
        setIncludeDescendants(true);
        setCurrent(1);
    };

    const handleClickChild = (childId: string) => {
        setSelectedCategory(childId);
        setIncludeDescendants(false);
        setCurrent(1);
    };

    const items = [
        { key: "sort=-sold", label: `Phổ biến`, children: <></> },
        { key: 'sort=-updatedAt', label: `Hàng Mới`, children: <></> },
        { key: 'sort=price', label: `Giá Thấp Đến Cao`, children: <></> },
        { key: 'sort=-price', label: `Giá Cao Đến Thấp`, children: <></> },
    ];

    const ProductCard = (item: IProductTable) => (
        <div onClick={() => navigate(`/Product/${item._id}`)} className="column" key={item._id}>
            <div className='wrapper'>
                <div className='thumbnail'>
                    <img src={`${import.meta.env.VITE_BACKEND_URL}/images/Product/${item.thumbnail}`} alt="thumbnail Product" />
                </div>
                <div className='text' title={item.name}>{item.name}</div>
                <div className='price'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                </div>
                <div className='rating'>
                    <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 10 }} />
                    <span>Đã bán {item?.sold ?? 0}</span>
                </div>
            </div>
        </div>
    );

    // ===== BANNER SETTINGS =====
    const bannerSettings = {
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        speed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        pauseOnHover: false,
        cssEase: "linear",
    };

    return (
        <div className="main-layout">
            {/* ==== SIDEBAR ==== */}
            <aside className="sidebar" onMouseLeave={() => setHoveringMenu(false)}>
                <div className="sidebar-inner">
                    {/* <h3>Danh mục sản phẩm</h3> */}
                    {listCategory.map((item) => (
                        <div
                            key={item.value}
                            className={`sidebar-item ${activeParentId === item.value ? 'active' : ''}`}
                            onMouseEnter={() => handleHoverParent(item.value)}
                            onClick={() => handleClickParent(item.value)}
                        >
                            {guessIcon(item.label)}
                            <span>{item.label}</span>

                            {/* --- NHÉT con VÀO ĐÂY --- */}
                            {hoveringMenu && activeParentId === item.value && (
                                <div className="sidebar-children">
                                    {(childrenByParent[item.value] ?? []).map(child => (
                                        <div
                                            key={child._id}
                                            className="sidebar-child"
                                            onClick={(e) => { e.stopPropagation(); handleClickChild(child._id); }}
                                        >
                                            {child.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                </div>
            </aside>

            {/* ==== MAIN CONTENT ==== */}
            <main className="main-content">
                {/* ===== BANNER ===== */}
                <div className="banner-container">
                    <Slider
                        dots={true}
                        infinite={true}
                        speed={600}
                        slidesToShow={1}
                        slidesToScroll={1}
                        arrows={false}
                        autoplay={true}       // ✅ bật auto
                        autoplaySpeed={3000}  // ✅ 3 giây chuyển 1 lần
                        pauseOnHover={true}   // dừng khi người dùng rê chuột
                        appendDots={(dots) => (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "15px",
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <ul style={{ margin: "0px" }}> {dots} </ul>
                            </div>
                        )}
                    >
                        <div><img src="/banner/baner1.png" alt="banner1" /></div>
                        <div><img src="/banner/baner2.jpg" alt="banner2" /></div>
                        <div><img src="/banner/baner3.jpg" alt="banner3" /></div>
                    </Slider>
                </div>


                {/* ===== PRODUCT SECTIONS ===== */}
                <div style={{ background: '#efefef', padding: "20px 0" }}>
                    <div className="homepage-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
                        <Row gutter={[20, 20]}>
                            <Col md={24} xs={24}>
                                {(!selectedCategory && !filter && !searchTerm) ? (
                                    <Spin spinning={sectionLoading} tip="Loading...">
                                        <div style={{ display: 'grid', gap: 24 }}>
                                            {listCategory.map((cat) => {
                                                const items = parentProducts[cat.value] || [];
                                                if (items.length === 0) return null;
                                                return (
                                                    <div key={cat.value} style={{ padding: "16px", background: '#fff', borderRadius: 6 }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                                                            <h3 style={{ margin: 0, fontWeight: 700 }}>{cat.label.toUpperCase()}</h3>
                                                            <Button type="link" onClick={() => handleClickParent(cat.value)}>Xem tất cả</Button>
                                                        </div>
                                                        <Row className='customize-row'>
                                                            {items.map((item) => ProductCard(item))}
                                                        </Row>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Spin>
                                ) : (
                                    <Spin spinning={isLoading} tip="Loading...">
                                        <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                            <Row >
                                                <Tabs
                                                    defaultActiveKey="sort=-sold"
                                                    items={items}
                                                    onChange={(value) => { setSortQuery(value); setCurrent(1); }}
                                                    style={{ overflowX: "auto" }}
                                                />
                                            </Row>
                                            <Row className='customize-row'>
                                                {listProduct?.map((item) => ProductCard(item))}
                                            </Row>
                                            <div style={{ marginTop: 30 }}></div>
                                            <Row style={{ display: "flex", justifyContent: "center" }}>
                                                <Pagination current={current} total={total} pageSize={pageSize} responsive
                                                    onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })} />
                                            </Row>
                                        </div>
                                    </Spin>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
