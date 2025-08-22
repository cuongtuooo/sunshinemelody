// src/components/admin/category/UpdateChildCategory.tsx
import { useEffect, useState } from 'react';
import { App, Modal, Form, Input, Select } from 'antd';
import type { FormProps } from 'antd';
import { getCategoriesParentAPI, updateChildCategoryAPI } from '@/services/api';

interface IProps {
    open: boolean;
    onClose: () => void;
    refreshTable: () => void;
    dataUpdate: ICategory | null; // danh mục đang sửa
}

type FieldType = {
    name: string;
    parentId?: string | null;
};

const UpdateChildCategory = ({ open, onClose, refreshTable, dataUpdate }: IProps) => {
    const { message, notification } = App.useApp();
    const [form] = Form.useForm<FieldType>();
    const [isSubmit, setIsSubmit] = useState(false);
    const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const loadParents = async () => {
            const res = await getCategoriesParentAPI();
            const arr = res?.data ?? [];
            setParentOptions(arr.map((c: ICategory) => ({ label: c.name, value: c._id })));
        };
        loadParents();
    }, []);

    useEffect(() => {
        if (open && dataUpdate) {
            // nếu entity không có parent -> để trống (root)
            form.setFieldsValue({
                name: dataUpdate.name,
                // @ts-ignore: backend trả parent?: string | null
                parentId: (dataUpdate as any).parent ?? undefined,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, dataUpdate]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        if (!dataUpdate?._id) return;
        try {
            setIsSubmit(true);
            const res = await updateChildCategoryAPI(
                dataUpdate._id,
                values.name,
                values.parentId ?? undefined // nếu muốn đưa về root: truyền null (tuỳ backend)
            );
            if (res?.data) {
                message.success('Cập nhật danh mục thành công');
                onClose();
                refreshTable();
            } else {
                notification.error({ message: 'Đã có lỗi xảy ra', description: res.message });
            }
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Modal
            title="Cập nhật danh mục"
            open={open}
            onOk={() => form.submit()}
            onCancel={onClose}
            okButtonProps={{ loading: isSubmit }}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item<FieldType>
                    name="name"
                    label="Tên danh mục"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType> name="parentId" label="Thư mục cha">
                    <Select
                        allowClear
                        placeholder="Chọn thư mục cha (bỏ trống = đưa về root)"
                        options={parentOptions}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateChildCategory;
