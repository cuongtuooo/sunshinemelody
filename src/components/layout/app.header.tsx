import { useState, useEffect } from 'react';
import {
    Input, Badge, Popover, Dropdown, Space, Divider, Drawer, Empty
} from 'antd';
import {
    ShoppingCartOutlined, CustomerServiceOutlined, SearchOutlined,
    MenuOutlined, AppstoreOutlined, RightOutlined, CloseOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentApp } from '@/components/context/app.context';
import { logoutAPI, getCategoriesParentAPI, getCategoryChildrenAPI } from '@/services/api';
import ManageAccount from '../client/account';
import './app.header.scss';
import { isMobile } from 'react-device-detect';

const AppHeader = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated, user, setUser, setIsAuthenticated,
        carts, setCarts
    } = useCurrentApp();

    const [openDrawer, setOpenDrawer] = useState(false);
    const [openManageAccount, setOpenManageAccount] = useState(false);
    const [openCategorySidebar, setOpenCategorySidebar] = useState(false);
    const [listCategory, setListCategory] = useState<any[]>([]);
    const [hoveredParent, setHoveredParent] = useState<string | null>(null);
    const [childrenByParent, setChildrenByParent] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getCategoriesParentAPI();
            if (res && res.data) setListCategory(res.data);
        };
        fetchCategories();
    }, []);

    // lấy danh mục con khi hover
    const handleHoverParent = async (parentId: string) => {
        setHoveredParent(parentId);
        if (!childrenByParent[parentId]) {
            const res = await getCategoryChildrenAPI(parentId);
            const arr = res?.data ?? [];
            setChildrenByParent(prev => ({ ...prev, [parentId]: arr }));
        }
    };

    // click cha → về homepage & lọc deep
    const handleClickParent = (id: string) => {
        navigate('/');
        setOpenCategorySidebar(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('filterCategory', { detail: { id, deep: true } }));
        }, 200);
    };

    // click con → về homepage & lọc riêng
    const handleClickChild = (id: string) => {
        navigate('/');
        setOpenCategorySidebar(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('filterCategory', { detail: { id, deep: false } }));
        }, 200);
    };

    // logout
    const handleLogout = async () => {
        const res = await logoutAPI();
        if (res.data) {
            setUser(null);
            setCarts([]);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
            localStorage.removeItem('carts');
        }
    };

    let accountMenu = [
        { label: <label onClick={() => setOpenManageAccount(true)}>Quản lý tài khoản</label>, key: 'acc' },
        { label: <Link to="/history">Lịch sử mua hàng</Link>, key: 'history' },
        { label: <label onClick={handleLogout}>Đăng xuất</label>, key: 'logout' },
    ];
    if (user?.role?.name === 'SUPER_ADMIN')
        accountMenu.unshift({ label: <Link to="/admin">Trang quản trị</Link>, key: 'admin' });

    const contentPopover = () => (
        <div className="pop-cart-body">
            <div className="pop-cart-content">
                {carts?.map((book, i) => (
                    <div className="book" key={i}>
                        <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/Product/${book?.detail?.thumbnail}`}
                            alt={book?.detail?.name}
                        />
                        <div className="book-info">
                            <div className="name">{book?.detail?.name}</div>
                            <div className="price">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book?.detail?.price ?? 0)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {carts?.length ? (
                <div className="pop-cart-footer">
                    <button onClick={() => navigate('/order')}>Xem giỏ hàng</button>
                </div>
            ) : <Empty description="Không có sản phẩm" />}
        </div>
    );

    return (
        <>
            {/* ===== HEADER ===== */}
            <div className="app-header">
                <div className="header-top">
                    <div className="container">
                        <div className="menu-icon" onClick={() => setOpenDrawer(true)}>
                            <MenuOutlined />
                        </div>
                        <div className="logo" onClick={() => navigate('/')}>
                            {/* <img src="/logo.png" alt="Logo" /> */}
                            <span>SunShine Melody</span>
                        </div>

                        <div className="search-box">
                            <Input
                                size="large"
                                placeholder="Nhập từ khóa bạn muốn tìm kiếm"
                                prefix={<SearchOutlined />}
                                onPressEnter={(e) => navigate(`/search?keyword=${e.currentTarget.value}`)}
                            />
                        </div>

                        <div className="right-group">
                            <div className="hotline">
                                <div><CustomerServiceOutlined /> <span>Phía bắc:</span> <b>090 321 6609</b></div>
                                <div><CustomerServiceOutlined /> <span>Phía nam:</span> <b>0909 015 886</b></div>
                            </div>

                            {!isMobile ? (
                                <Popover content={contentPopover} placement="bottomRight" title="Sản phẩm mới thêm">
                                    <Badge count={carts?.length ?? 0}><ShoppingCartOutlined className="cart-icon" /></Badge>
                                </Popover>
                            ) : (
                                <Badge count={carts?.length ?? 0} onClick={() => navigate('/order')}>
                                    <ShoppingCartOutlined className="cart-icon" />
                                </Badge>
                            )}

                            <div className="account">
                                {!isAuthenticated ? (
                                    <span onClick={() => navigate('/login')}>Đăng nhập / Đăng ký</span>
                                ) : (
                                    <Dropdown menu={{ items: accountMenu }} trigger={['click']}>
                                        <Space className="account-dropdown">{user?.name}</Space>
                                    </Dropdown>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-nav">
                    <div className="container">
                        <ul>
                            <li className="active" onClick={() => setOpenCategorySidebar(true)}>
                                <AppstoreOutlined style={{ marginRight: 6 }} /> Danh mục sản phẩm
                            </li>
                            <Link to="/about"><li>Về chúng tôi</li></Link>
                            <Link to="/showroom"><li>Showroom</li></Link>
                            <Link to="/lienhe"><li>Liên Hệ</li></Link>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ===== SIDEBAR ===== */}
            {openCategorySidebar && (
                <>
                    <div className="overlay" onClick={() => setOpenCategorySidebar(false)} />
                    <div className="category-sidebar">
                        <div className="sidebar-header">
                            <span>Danh mục sản phẩm</span>
                            <CloseOutlined onClick={() => setOpenCategorySidebar(false)} />
                        </div>

                        <div className="sidebar-body">
                            {listCategory.map(parent => (
                                <div
                                    key={parent._id}
                                    className={`sidebar-item ${hoveredParent === parent._id ? 'active' : ''}`}
                                    onMouseEnter={() => handleHoverParent(parent._id)}
                                    onClick={() => handleClickParent(parent._id)}
                                >
                                    <div className="sidebar-parent">
                                        <AppstoreOutlined className="icon" />
                                        <span>{parent.name}</span>
                                    </div>

                                    {/* Hiện danh mục con */}
                                    {hoveredParent === parent._id && (
                                        <div className="sidebar-children">
                                            {(childrenByParent[parent._id] ?? []).map(child => (
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

                    </div>
                </>
            )}

            <Drawer title="Menu chức năng" placement="left" onClose={() => setOpenDrawer(false)} open={openDrawer}>
                <p onClick={() => setOpenManageAccount(true)}>Quản lý tài khoản</p>
                <Divider />
                <p onClick={handleLogout}>Đăng xuất</p>
                <Divider />
                <p onClick={() => navigate('/order')}>Xem giỏ hàng</p>
            </Drawer>

            <ManageAccount isModalOpen={openManageAccount} setIsModalOpen={setOpenManageAccount} />
        </>
    );
};

export default AppHeader;
