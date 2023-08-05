import { useState, useEffect, Fragment } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { setUsers, setTags, setUserCategories } from '../../store/slices/usersSlice'

import { getAllUserCategories, getAllUserTags, getUsers, postUpdateUser, postSendingToUsersRoute, getCategories } from '../../api/api'

import { setData as setCategories } from '../../store/slices/categoriesSlice'

import { SendingCreate, EditUserModal } from '../../components'
import { Row, Col, Typography, Table, Avatar, Space, Tag, Button } from 'antd'

import { UserOutlined } from '@ant-design/icons'


const STATUS = {
    loading: "loading",
    success: "success",
    error: "error"
}

const roles = {
    MANAGER: "Менеджер",
    ADMIN: "Администратор",
    COPYWRITER: "Копирайтер",
    STUDENT: "СТУДЕНТ"
}



const UsersPage = ({ token }) => {
    const dispatch = useDispatch()
    const { users, userCategories, tags } = useSelector(state => state.users)

    const { data: categories } = useSelector(state => state.categories)

    const [status, setStatus] = useState(STATUS.success)

    const [, setError] = useState(null)

    const [selectedUser, setSelectedUser] = useState(null)

    const columns = [
        {
            title: "ID",
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: "Пользователь",
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <Space>
                <Avatar size="small" src={record?.profile_pic ? `https://promo.productlab.pro/api/${record.profile_pic}` : ""} icon={<UserOutlined />} />
                <Typography.Text>{text}</Typography.Text>
            </Space>
        },
        {
            title: "О пользователе",
            dataIndex: 'about',
            key: 'about',
            render: (text) => <Typography.Text
                style={{ width: 200 }}
                ellipsis={{ tooltip: text }}
            >
                {text}
            </Typography.Text>,
        },
        {
            title: "Тэги",
            dataIndex: 'tags',
            key: 'tags',
            render: (tags) => <span>
                {tags?.length ? tags.map((tag) => {

                    return (
                        <Tag key={tag?.id}>
                            {tag?.name}
                        </Tag>
                    );
                }) : <Typography.Text>Тэги отсутсвуют</Typography.Text>}
            </span>,
        },
        {
            title: "Категории",
            dataIndex: 'category',
            key: 'category',
            render: (category) => <span>
                {category?.length ? category.map((c) => {
                    return (
                        <Tag key={c?.id}>
                            {c?.name}
                        </Tag>
                    );
                }) : <Typography.Text>Категории отсутсвуют</Typography.Text>}
            </span>,
        },
        {
            title: "Роль",
            dataIndex: 'role',
            key: 'role',
            render: (text) => <Typography.Text>{roles[text] || text}</Typography.Text>,
        },
        {
            title: 'Действие',
            key: 'action',
            render: (_, record) => <Typography.Link onClick={() => setSelectedUser(record)}>Редактировать</Typography.Link>
        },
    ]

    const handleUpdate = async (values) => {
        await postUpdateUser(selectedUser.id, token, values)
    }

    const handleSending = async (values) => {
        return await postSendingToUsersRoute(values, token)
    }


    useEffect(() => {
        const initial = async () => {
            try {
                setStatus(STATUS.loading)

                if (!users.length) {
                    await getUsers().then((data) => {
                        dispatch(setUsers(data?.result || []))
                    })
                }

                if (!tags.length) {
                    await getAllUserTags().then((data) => {
                        dispatch(setTags(data?.items || []))
                    })
                }

                if (!userCategories.length) {
                    await getAllUserCategories().then((data) => {
                        dispatch(setUserCategories(data?.items || []))
                    })
                }

                if (!categories.length) {
                    await getCategories().then((data) => {
                        dispatch(setCategories(data))
                    })
                }

                setStatus(STATUS.success)
            }
            catch (error) {
                setStatus(STATUS.error)
                setError({
                    code: error?.code,
                    message: error?.message
                })
            }
        }

        initial()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Fragment>
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Typography.Title level={3}>Пользователи</Typography.Title>
                    <SendingCreate
                        token={token}
                        tags={tags}
                        userCategories={userCategories}
                        onSubmit={handleSending}
                        trigger={<Button>Создать рассылку</Button>}
                    />
                </Col>
                <Col span={24}>
                    <Table loading={status === STATUS.loading} columns={columns} rowKey='id' dataSource={users} />
                </Col>
            </Row>
            {selectedUser &&
                <EditUserModal
                    categories={categories}
                    show={!!selectedUser}
                    setShow={() => setSelectedUser(null)}
                    onSubmit={handleUpdate}
                    tags={tags}
                    userCategories={userCategories}
                    data={selectedUser}
                />
            }
        </Fragment>
    )
}

export { UsersPage }