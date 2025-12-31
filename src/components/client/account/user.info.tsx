import { useCurrentApp } from "@/components/context/app.context";
import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Col, Form, Input, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import type { UploadFile } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { uploadFileAPI, updateUserInfoAPI } from "@/services/api";

type FieldType = {
    _id: string;
    email: string;
    name: string;
    phone: string;
    role: string;      // chỉ để hiển thị
};

const UserInfo = () => {
    const [form] = Form.useForm();
    const { user, setUser } = useCurrentApp();

    const [userAvatar, setUserAvatar] = useState(user?.avatar ?? "");
    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${userAvatar}`;

    // ====================================================
    // SET DATA VÀO FORM
    // ====================================================
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                _id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role?.name // hiển thị tên role
            });
        }
    }, [user]);

    // ====================================================
    // Upload Avatar
    // ====================================================
    const handleUploadFile = async (options: RcCustomRequestOptions) => {
        const file = options.file as UploadFile;
        const { onSuccess, onError } = options;

        const res = await uploadFileAPI(file, "avatar");

        if (res && res.data) {
            const newAvatar = res.data.fileName;
            setUserAvatar(newAvatar);
            onSuccess && onSuccess("ok");
        } else {
            onError && onError(new Error("Upload failed"));
        }
    };

    const propsUpload = {
        maxCount: 1,
        showUploadList: false,
        customRequest: handleUploadFile
    };

    // ====================================================
    // SUBMIT FORM
    // ====================================================
    const onFinish = async (values: FieldType) => {
        const payload = {
            _id: values._id,
            name: values.name,
            email: values.email,
            phone: values.phone,
            avatar: userAvatar   // avatar lấy từ state, không lấy từ form
        };

        setIsSubmit(true);

        const res = await updateUserInfoAPI(payload);

        if (res && res.data) {
            // update context (react state)
            setUser({
                ...user!,
                name: payload.name,
                phone: payload.phone,
                avatar: payload.avatar,
                email: payload.email
            });

            message.success("Cập nhật thông tin thành công");

            // ép reload token
            localStorage.removeItem("access_token");
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            });
        }

        setIsSubmit(false);
    };

    return (
        <div style={{ minHeight: 400 }}>
            <Row gutter={[40, 40]}>

                {/* ====== AVATAR ====== */}
                {/* <Col sm={24} md={10}>
                    <Row gutter={[20, 20]} justify="center">
                        <Col>
                            <Avatar
                                size={150}
                                src={urlAvatar}
                                icon={<AntDesignOutlined />}
                            />
                        </Col>
                        <Col>
                            <Upload {...propsUpload}>
                                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                            </Upload>
                        </Col>
                    </Row>
                </Col> */}

                {/* ====== FORM ====== */}
                <Col sm={24} md={14}>
                    <Form form={form} onFinish={onFinish} autoComplete="off">

                        <Form.Item name="_id" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Email" name="email"
                            rules={[{ required: true, message: "Email không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Tên hiển thị" name="name"
                            rules={[{ required: true, message: "Tên không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Số điện thoại" name="phone"
                            rules={[{ required: true, message: "Số điện thoại không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Role" name="role">
                            <Input disabled />   {/* Không cho sửa */}
                        </Form.Item>

                        <Button
                            type="primary"
                            loading={isSubmit}
                            onClick={() => form.submit()}
                        >
                            Cập nhật
                        </Button>

                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default UserInfo;
