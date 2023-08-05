import { useState, Fragment, useMemo } from "react"

import { Modal, Input, Select, Button, Form, Checkbox, Upload } from "antd"

import { UploadOutlined } from '@ant-design/icons'

import "./EditUserModal.css"

import { API_URL } from "../../../api/api"

const roles = ["ADMIN", "MANAGER", "STUDENT", "COPYWRITER"]


const EditUserModal = (props) => {
    const [isLoading, setIsLoading] = useState(false)

    const {
        show = false,
        setShow = () => { },
        onSubmit = () => { },
        data = null,
        userCategories = [],
        categories = [],
        tags = []
    } = props

    const [form] = Form.useForm();

    const initialValues = data ? {
        ...data,
        tags: data?.tags.map((tag) => tag?.id),
        category: data?.category.map((c) => c?.id),
        profile_pic: data?.profile_pic ? [{
            status: "done",
            uid: '0',
            name: data?.profile_pic,
            url: `${API_URL}/api/${data.profile_pic}`,
            thumbUrl: `${API_URL}/api/${data.profile_pic}`,
        }] : []
    } : null

    const tagsOptions = useMemo(() => tags.map((tag) => ({ value: tag?.id, label: tag?.name })), [tags])
    const categoryUserOptions = useMemo(() => userCategories.map((category) => ({ value: category?.id, label: category?.name })), [userCategories])
    const categoryOptions = useMemo(() => categories.map((category) => ({ value: category?.id, label: category?.name })), [categories])


    const handleToggle = () => setShow(show => !show)

    const handleSubmit = () => {
        setIsLoading(true)
        try {
            form.validateFields().then(async (values) => {

                const avatar = values.profile_pic[0].thumbUrl

                const currentAvatar = !avatar.includes(data?.profile_pic) ? avatar : data?.profile_pic

                await onSubmit({ ...values, profile_pic: currentAvatar })

                setIsLoading(false)
                setShow(false)
            })
        } catch (error) {
            setIsLoading(false)
            setShow(false)
        }
    }

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <Fragment>
            <Modal
                className="edit-user-modal"
                title="Редактирование пользователя"
                okText="Обновить"
                cancelText="Закрыть"
                confirmLoading={isLoading}
                open={show}
                onCancel={handleToggle}
                onOk={handleSubmit}

            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={initialValues}
                >
                    <Form.Item label='Аватар' name='profile_pic' valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload
                            listType="picture"
                            name="files"
                            customRequest={({ onSuccess }) => onSuccess("ok")}
                            accept=".jpg, .jpeg, .png"
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Загрузить изображение</Button>
                        </Upload>

                    </Form.Item>
                    <Form.Item label="Имя" name="name">
                        <Input />
                    </Form.Item>
                    <Form.Item label="О себе" name="about">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Роль" name="role">
                        <Select options={roles.map((role) => ({ value: role }))} />
                    </Form.Item>
                    <Form.Item label="Категории" name="category">
                        <Select
                            mode='multiple'
                            maxTagCount="responsive"
                            options={categoryUserOptions}
                        />
                    </Form.Item>
                    <Form.Item label="Тэги" name="tags">
                        <Select
                            mode='multiple'
                            placement="topLeft"
                            maxTagCount="responsive"
                            options={tagsOptions}
                        />
                    </Form.Item>
                    <Form.Item label="Доступ к категории" name="category_academy">
                        <Select
                            mode='multiple'
                            placement="topLeft"
                            options={categoryOptions}
                        />
                    </Form.Item>
                    <Form.Item name="is_dismissed" valuePropName="checked">
                        <Checkbox>Уволен</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export { EditUserModal }