import axios from 'services/axios.customize';

export const loginAPI = (username: string, password: string) => {
    const urlBackend = "/api/v1/auth/login";
    return axios.post<IBackendRes<ILogin>>(urlBackend, { username, password }, {
        headers: {
            delay: 1000
        }
    })
}

export const registerAPI = (name: string, email: string, password: string, phone: string) => {
    const urlBackend = "/api/v1/auth/register";
    return axios.post<IBackendRes<IRegister>>(urlBackend, { name, email, password, phone })
}

export const fetchAccountAPI = () => {
    const urlBackend = "/api/v1/auth/account";
    return axios.get<IBackendRes<IFetchAccount>>(urlBackend, {
        headers: {
            delay: 100
        }
    })
}

export const logoutAPI = () => {
    const urlBackend = "/api/v1/auth/logout";
    return axios.get<IBackendRes<IRegister>>(urlBackend)
}

export const getUsersAPI = (query: string) => {
    const urlBackend = `/api/v1/users?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend)
}

export const createUserAPI = (name: string, email: string,
    password: string, phone: string) => {
    const urlBackend = "/api/v1/users";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { name, email, password, phone, role:"6883003aac8a30a7ede53073" })
}

export const bulkCreateUserAPI = (hoidanit: {
    name: string;
    password: string;
    email: string;
    phone: string;
}[]) => {
    const urlBackend = "/api/v1/user/bulk-create";
    return axios.post<IBackendRes<IResponseImport>>(urlBackend, hoidanit)
}

export const updateUserAPI = (_id: string, name: string, phone: string) => {
    const urlBackend = `/api/v1/users`;
    return axios.patch<IBackendRes<IRegister>>(urlBackend,
        { _id, name, phone })
}

export const deleteUserAPI = (_id: string) => {
    const urlBackend = `/api/v1/user/${_id}`;
    return axios.delete<IBackendRes<IRegister>>(urlBackend)
}

export const getProductsAPI = (query: string) => {
    const urlBackend = `/api/v1/Product?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IProductTable>>>(urlBackend,
        {
            headers: {
                delay: 100
            }
        }
    )
}

// Lấy con trực tiếp của 1 node
export const getCategoryChildrenAPI = (id: string) => {
    const urlBackend = `/api/v1/category/${id}/children`;
    return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};

// Tạo: root hoặc child
// - Root: chỉ truyền name
// - Child: truyền name + parentId
// - slug: chỉ truyền khi thật sự có (để rỗng sẽ KHÔNG gửi)
export const createChildCategoryAPI = (name: string, parentId?: string | null, slug?: string) => {
    const urlBackend = `/api/v1/category`;
    const payload: any = { name };
    if (parentId) payload.parentId = parentId;       // chỉ set khi có
    if (slug && slug.trim()) payload.slug = slug;    // chỉ set khi có
    return axios.post<IBackendRes<IRegister>>(urlBackend, payload);
};

// Update: đổi tên và/hoặc đổi parent
// - name: chỉ gửi khi khác undefined và không rỗng
// - parentId: gửi string hợp lệ hoặc null để gỡ parent; undefined = không đổi
export const updateChildCategoryAPI = (_id: string, name?: string, parentId?: string | null) => {
    const urlBackend = `/api/v1/category/${_id}`;
    const payload: any = {};
    if (typeof name === 'string' && name.trim() !== '') payload.name = name.trim();
    if (parentId === null) payload.parentId = null;          // gỡ parent
    else if (typeof parentId === 'string' && parentId) payload.parentId = parentId; // set parent mới
    // nếu parentId === undefined => không đổi parent
    return axios.patch<IBackendRes<IRegister>>(urlBackend, payload);
};
// Lấy các danh mục gốc (roots)
export const getCategoriesParentAPI = () => {
    const urlBackend = `/api/v1/category/roots`;
    return axios.get<IBackendRes<ICategory[]>>(urlBackend, { headers: { delay: 100 } });
};

export const getCategoriesAPI = (query: string) => {
    const urlBackend = `/api/v1/category?${query}`;
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(urlBackend,
        {
            headers: {
                delay: 100
            }
        }
    )
}

export const getCategoryAPI = () => {
    const urlBackend = `/api/v1/category`;
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(urlBackend);
}

export const createCategoryAPI = (
    name: string, slug: string,
) => {
    const urlBackend = "/api/v1/category";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { name, slug})
}

export const updateCategoryAPI = (
    _id: string, name: string,
) => {
    const urlBackend = `/api/v1/category/${_id}`;
    return axios.patch<IBackendRes<IRegister>>(urlBackend,
        { name})
}

// Xoá (soft delete)
export const deleteCategoryAPI = (_id: string) => {
    const urlBackend = `/api/v1/category/${_id}`;
    return axios.delete<IBackendRes<IRegister>>(urlBackend);
};

export const uploadFileAPI = (fileImg: any, folder: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileUpload', fileImg);
    return axios<IBackendRes<{
        fileName: string
    }>>({
        method: 'post',
        url: '/api/v1/files/upload',
        data: bodyFormData,
        headers: {
            "upload-type": folder
        },
    });
}


export const createProductAPI = (
    name: string, mainText: string, desc:string, 
    price: number, quantity: number, category: string,
    thumbnail: string, slider: string[]
) => {
    const urlBackend = "/api/v1/Product";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { name, mainText, desc,  price, quantity, category, thumbnail, slider, sold: 0 })
}


export const updateProductAPI = (
    _id: string, name: string,
    mainText: string, desc: string,
    price: number, quantity: number, category: string,
    thumbnail: string, slider: string[]
) => {
    const urlBackend = `/api/v1/Product/${_id}`;
    return axios.patch<IBackendRes<IRegister>>(urlBackend,
        { name, mainText, desc, price, quantity, category, thumbnail, slider })
}


export const deleteProductAPI = (_id: string) => {
    const urlBackend = `/api/v1/Product/${_id}`;
    return axios.delete<IBackendRes<IRegister>>(urlBackend)
}

export const getProductByIdAPI = (id: string) => {
    const urlBackend = `/api/v1/Product/${id}`;
    return axios.get<IBackendRes<IProductTable>>(urlBackend,
        {
            headers: {
                delay: 100
            }
        }
    )
}

// ✅ Gọi sản phẩm theo **danh mục CHA** và **gom cả con/cháu** (deep=true)
export const getProductsByParentDeepAPI = (
    parentId: string,
    current = 1,
    pageSize = 20,
    extraQuery = "" // ví dụ: "sort=-sold&price>=1000000"
) => {
    const q = `category=${parentId}&deep=true&current=${current}&pageSize=${pageSize}${extraQuery ? `&${extraQuery}` : ""}`;
    const urlBackend = `/api/v1/Product?${q}`;
    return axios.get<IBackendRes<IModelPaginate<IProductTable>>>(urlBackend, { headers: { delay: 100 } });
};

export const createOrderAPI = (
    name: string, address: string,
    phone: string, totalPrice: number,
    type: string, detail: any
) => {
    const urlBackend = "/api/v1/order";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { name, address, phone, totalPrice, type, detail })
}

export const getHistoryAPI = () => {
    const urlBackend = `/api/v1/history`;
    return axios.get<IBackendRes<IHistory[]>>(urlBackend)
}

export const updateUserInfoAPI = (
    _id: string, avatar: string, email:string,
    name: string, phone: string, role:string) => {
    const urlBackend = `/api/v1/users`;
    return axios.patch<IBackendRes<IRegister>>(urlBackend,
        { name, phone, avatar, _id, role, email })
}

export const updateUserPasswordAPI = (
    email: string, oldpass: string, newpass: string) => {
    const urlBackend = "/api/v1/users/change-password";
    return axios.post<IBackendRes<IRegister>>(urlBackend,
        { email, oldpass, newpass })
}

export const getOrdersAPI = (query: string) => {
    const urlBackend = `/api/v1/order?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IOrderTable>>>(urlBackend)
}

export const getDashboardAPI = () => {
    const urlBackend = `/api/v1/dashboard`;
    return axios.get<IBackendRes<{
        totalOrders: number;
        // countUser: number;
        totalProducts: number;
    }>>(urlBackend)
}

// Update order status
export const updateOrderStatusAPI = (id: string, status: string) => {
    const urlBackend = `/api/v1/order/${id}/status`;
    return axios.patch<IBackendRes<any>>(urlBackend, { status });
};

// Cancel order
export const cancelOrderAPI = (id: string) => {
    const urlBackend = `/api/v1/order/${id}/cancel`;
    return axios.post<IBackendRes<any>>(urlBackend);
};

// Tạo đánh giá
export const createReviewAPI = (
    productId: string,
    content: string,
    rating: number
) => {
    const urlBackend = `/api/v1/review`;
    return axios.post<IBackendRes<any>>(urlBackend, { productId, content, rating });
};

// Lấy danh sách đánh giá theo sản phẩm
export const getReviewByProductAPI = (productId: string) => {
    const urlBackend = `/api/v1/review?productId=${productId}`;
    return axios.get<IBackendRes<any[]>>(urlBackend);
};

/* =========================================================
   CHAT – USER SEND
========================================================= */

// Khách gửi tin nhắn
export const userSendChatAPI = (
    sessionId: string,
    content: string,
    customerName?: string,
    customerEmail?: string,
    userId?: string
) => {
    return axios.post("/api/v1/chat/user-send", {
        sessionId,
        content,
        name: customerName,
        email: customerEmail,
        userId,
    });
};


// Lấy danh sách tin nhắn của conversation
export const getChatMessagesAPI = (conversationId: string) => {
    return axios.get(`/api/v1/chat/messages/${conversationId}`);
};

// Lấy toàn bộ conversation (admin)
export const getChatConversationsAPI = () => {
    return axios.get(`/api/v1/chat/conversations`);
};

// Admin gửi tin nhắn
export const adminSendChatAPI = (body: any) => {
    return axios.post(`/api/v1/chat/admin-send`, body);
};
