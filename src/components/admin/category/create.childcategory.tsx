// src/components/admin/category/CreateChildCategory.tsx
import { useEffect, useState } from 'react';
import { App, Modal, Form, Input, Select } from 'antd';
import type { FormProps } from 'antd';
import { createChildCategoryAPI, getCategoriesParentAPI } from '@/services/api';

interface IProps {
    open: boolean;
    onClose: () => void;
    refreshTable: () => void;
    presetParent: ICategory | null; // nếu mở từ 1 dòng cha, set sẵn ở đây
}

type FieldType = {
    name: string;
    parentId: string;
    slug: string;

};

const CreateChildCategory = ({ open, onClose, refreshTable, presetParent }: IProps) => {
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
        if (open) {
            form.resetFields();
            if (presetParent) form.setFieldsValue({ parentId: presetParent._id });
        }
    }, [open, presetParent]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            setIsSubmit(true);
            const res = await createChildCategoryAPI(values.name, values.parentId, values.slug);
            if (res?.data) {
                message.success('Tạo thư mục con thành công');
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
            title="Thêm thư mục con"
            open={open}
            onOk={() => form.submit()}
            onCancel={onClose}
            okButtonProps={{ loading: isSubmit }}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item<FieldType>
                    name="parentId"
                    label="Thư mục cha"
                    rules={[{ required: true, message: 'Vui lòng chọn thư mục cha' }]}
                >
                    <Select
                        placeholder="Chọn thư mục cha"
                        options={parentOptions}
                        showSearch
                        optionFilterProp="label"
                        disabled={!!presetParent}
                    />
                </Form.Item>

                <Form.Item<FieldType>
                    name="name"
                    label="Tên thư mục con"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType>
                    name="slug"
                    label="Tên slug"
                    rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateChildCategory;
