import { useEffect, useMemo, useRef, useState } from 'react';
import { Tree, Input, Spin, Dropdown, App, Typography, Empty, Button } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    getCategoriesParentAPI,
    getCategoryChildrenAPI,
    createChildCategoryAPI,
    updateChildCategoryAPI,
    deleteCategoryAPI
} from '@/services/api';

const { Search } = Input;
const { Text } = Typography;

type Cat = ICategory & { slug?: string; parent?: string | null };

function toNode(c: Cat): DataNode {
    return {
        key: c._id,
        title: c.name,
        // KHÔNG set children ở đây để AntD biết node này còn khả năng có con
        isLeaf: false,
    };
}

function updateTree(nodes: DataNode[], id: string, updater: (n: DataNode) => DataNode): DataNode[] {
    return nodes.map((n) => {
        if (String(n.key) === id) return updater(n);
        if (n.children?.length) {
            return { ...n, children: updateTree(n.children, id, updater) };
        }
        return n;
    });
}

function getParentKey(nodes: DataNode[], id: string): string | undefined {
    for (const n of nodes) {
        if (n.children?.some((c) => String(c.key) === id)) return String(n.key);
        if (n.children?.length) {
            const found = getParentKey(n.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

function paintTree(nodes: DataNode[], painter: (n: DataNode) => React.ReactNode): DataNode[] {
    return nodes.map((n) => ({
        ...n,
        title: painter(n),
        children: n.children ? paintTree(n.children, painter) : n.children
    }));
}

export default function CategoryTreeManager() {
    const { message, modal } = App.useApp();

    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [loadedKeys, setLoadedKeys] = useState<React.Key[]>([]); // ★ để kiểm soát cache loadData
    const [search, setSearch] = useState('');

    // ---------- ROOTS ----------
    const refreshRoots = async () => {
        setLoading(true);
        try {
            const res = await getCategoriesParentAPI(); // { data: ICategory[] }
            const roots = (res.data ?? []).map(toNode);
            setTreeData(roots);
            setExpandedKeys([]);
            setSelectedKeys([]);
            setLoadedKeys([]); // reset cache
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshRoots();
    }, []);

    // ---------- LOAD CHILDREN (lazy) ----------
    const loadChildren: TreeProps['loadData'] = async (treeNode) => {
        const id = String(treeNode.key);
        const res = await getCategoryChildrenAPI(id);
        const kids = (res.data ?? []).map(toNode);
        setTreeData((prev) => updateTree(prev, id, (node) => ({ ...node, children: kids })));
    };

    // Tải lại nhánh & đánh dấu đã expand
    const reloadNode = async (id?: string) => {
        if (!id) return;
        const res = await getCategoryChildrenAPI(id);
        const kids = (res.data ?? []).map(toNode);

        setTreeData((prev) => updateTree(prev, id, (node) => ({ ...node, children: kids })));

        // mở nhánh này để thấy cập nhật ngay
        setExpandedKeys((k) => Array.from(new Set([...k, id])));

        // XÓA id khỏi loadedKeys để lần expand tới Tree sẽ gọi lại loadData (tránh cache cũ)
        setLoadedKeys((keys) => keys.filter((k) => String(k) !== id));
    };

    // ---------- DRAG & DROP (đổi parent) ----------
    const onDrop: TreeProps['onDrop'] = async (info) => {
        const dragKey = String(info.dragNode.key);
        const dropKey = String(info.node.key);

        try {
            await updateChildCategoryAPI(dragKey, undefined, dropKey);
            message.success('Đổi vị trí (re-parent) thành công');

            // reload cả nhánh mới và nhánh cũ
            await Promise.all([
                reloadNode(dropKey),
                reloadNode(getParentKey(treeData, dragKey))
            ]);
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Không thể đổi vị trí');
        }
    };

    // ---------- CREATE ----------
    const nameRef = useRef('');

    const addChild = async (parentId?: string | null) => {
        nameRef.current = '';
        modal.confirm({
            title: parentId ? 'Thêm thư mục con' : 'Thêm thư mục cha',
            content: (
                <Input
                    autoFocus
                    placeholder="Tên danh mục"
                    onChange={(e) => (nameRef.current = e.target.value)}
                />
            ),
            okText: 'Tạo',
            onOk: async () => {
                const name = nameRef.current.trim();
                if (!name) return message.warning('Vui lòng nhập tên');
                try {
                    if (parentId) {
                        await createChildCategoryAPI(name, parentId);
                        await reloadNode(parentId);
                    } else {
                        await createChildCategoryAPI(name);
                        await refreshRoots();
                    }
                    message.success('Tạo danh mục thành công');
                } catch (e: any) {
                    message.error(e?.response?.data?.message || 'Tạo danh mục thất bại');
                }
            },
        });
    };

    // ---------- RENAME ----------
    const rename = async (id: string, oldName: string) => {
        const renameRef = { current: oldName };
        modal.confirm({
            title: 'Đổi tên danh mục',
            content: (
                <Input
                    defaultValue={oldName}
                    onChange={(e) => (renameRef.current = e.target.value)}
                />
            ),
            okText: 'Lưu',
            onOk: async () => {
                const name = renameRef.current.trim();
                if (!name) return message.warning('Vui lòng nhập tên');
                try {
                    await updateChildCategoryAPI(id, name);
                    message.success('Đổi tên thành công');

                    const parentId = getParentKey(treeData, id);
                    if (parentId) await reloadNode(parentId);
                    else await refreshRoots();
                } catch (e: any) {
                    message.error(e?.response?.data?.message || 'Đổi tên thất bại');
                }
            },
        });
    };

    // ---------- DELETE ----------
    const removeNode = async (id: string) => {
        try {
            const resKids = await getCategoryChildrenAPI(id);
            const cnt = (resKids.data ?? []).length;

            modal.confirm({
                title: 'Xóa danh mục?',
                content:
                    cnt > 0
                        ? `Danh mục này đang có ${cnt} thư mục con. Bạn chắc chắn muốn xóa?`
                        : 'Bạn chắc chắn muốn xóa danh mục này?',
                okButtonProps: { danger: true },
                okText: 'Xóa',
                onOk: async () => {
                    try {
                        await deleteCategoryAPI(id);
                        message.success('Đã xóa');

                        const parentId = getParentKey(treeData, id);
                        if (parentId) {
                            await reloadNode(parentId);
                        } else {
                            await refreshRoots();
                        }

                        // xoá cache load của node vừa xoá & parent
                        setLoadedKeys((keys) => keys.filter((k) => String(k) !== id && String(k) !== parentId));
                    } catch (e: any) {
                        message.error(e?.response?.data?.message || 'Xóa thất bại');
                    }
                },
            });
        } catch {
            // fallback confirm
            modal.confirm({
                title: 'Xóa danh mục?',
                content: 'Bạn chắc chắn muốn xóa danh mục này?',
                okButtonProps: { danger: true },
                okText: 'Xóa',
                onOk: async () => {
                    try {
                        await deleteCategoryAPI(id);
                        message.success('Đã xóa');
                        const parentId = getParentKey(treeData, id);
                        if (parentId) await reloadNode(parentId);
                        else await refreshRoots();
                        setLoadedKeys((keys) => keys.filter((k) => String(k) !== id));
                    } catch (e: any) {
                        message.error(e?.response?.data?.message || 'Xóa thất bại');
                    }
                },
            });
        }
    };

    // ---------- Context menu trên node ----------
    const renderTitle = (node: DataNode) => {
        const id = String(node.key);
        const title = String(node.title);
        const items = [
            { key: 'add', icon: <PlusOutlined />, label: 'Thêm thư mục con', onClick: () => addChild(id) },
            { key: 'rename', icon: <EditOutlined />, label: 'Đổi tên', onClick: () => rename(id, title) },
            { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Xóa', onClick: () => removeNode(id) },
            { type: 'divider' as const },
            { key: 'refresh', icon: <ReloadOutlined />, label: 'Tải lại nhánh', onClick: () => reloadNode(id) },
        ];
        const highlight = search && title.toLowerCase().includes(search.toLowerCase());
        return (
            <Dropdown menu={{ items }} trigger={['contextMenu']}>
                <span>
                    {highlight ? (
                        <>
                            {title.split(new RegExp(`(${search})`, 'ig')).map((ch, i) =>
                                ch.toLowerCase() === search.toLowerCase() ? (
                                    <Text strong key={i}>{ch}</Text>
                                ) : (
                                    <span key={i}>{ch}</span>
                                )
                            )}
                        </>
                    ) : (
                        title
                    )}
                </span>
            </Dropdown>
        );
    };

    const paintedTree = useMemo(
        () => paintTree(treeData, renderTitle),
        [treeData, search]
    );

    // ---------- onExpand: nếu mở 1 node CHƯA loaded -> gọi loadData ngay ----------
    const handleExpand: TreeProps['onExpand'] = async (keys, info) => {
        setExpandedKeys(keys);

        const id = String(info.node.key);
        const alreadyLoaded = loadedKeys.includes(id);

        if (info.expanded && !alreadyLoaded) {
            await loadChildren(info.node);
            setLoadedKeys((prev) => Array.from(new Set([...prev, id])));
        }
    };

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Search
                    placeholder="Tìm theo tên"
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 360 }}
                />

                {/* Bỏ Dropdown 'Thao tác' theo yêu cầu */}

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        if (!selectedKeys.length) return message.info('Chọn 1 danh mục để thêm thư mục con');
                        addChild(String(selectedKeys[0]));
                    }}
                >
                    Thêm thư mục con
                </Button>

                <Button onClick={() => addChild(null)}>Thêm thư mục cha</Button>

                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        if (!selectedKeys.length) return message.info('Chọn 1 danh mục để xóa');
                        removeNode(String(selectedKeys[0]));
                    }}
                >
                    Xóa
                </Button>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refreshRoots()}
                >
                    Làm mới
                </Button>
            </div>

            <Spin spinning={loading}>
                {treeData.length === 0 ? (
                    <Empty description="Chưa có danh mục. Tạo danh mục cha để bắt đầu" />
                ) : (
                    <Tree
                        showLine
                        blockNode
                        draggable={{ icon: false }}
                        onDrop={onDrop}
                        height={560}
                        switcherIcon={<DownOutlined />}
                        treeData={paintedTree}
                        loadData={loadChildren}
                        expandedKeys={expandedKeys}
                        selectedKeys={selectedKeys}
                        loadedKeys={loadedKeys}              // ★ điều khiển cache load
                        onExpand={handleExpand}              // ★ expand để load nếu chưa có
                        onSelect={setSelectedKeys}
                    />
                )}
            </Spin>
        </div>
    );
}
