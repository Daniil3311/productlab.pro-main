import { Fragment, useState, cloneElement, useMemo } from 'react'
import { Modal, Form, Input, Select, Checkbox } from 'antd'

const initialValues = {
    tags_ids: [],
    categories_ids: [],
    text: "",
    skipBlocked: false
}

const SendingCreate = (props) => {
    const { trigger, userCategories, tags, onSubmit } = props

    const [form] = Form.useForm();

    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const tagsOptions = useMemo(() => tags.map((tag) => ({ value: tag?.id, label: tag?.name })), [tags])
    const categoryOptions = useMemo(() => userCategories.map((category) => ({ value: category?.id, label: category?.name })), [userCategories])

    const handleToggle = () => setOpen(opened => !opened)

    const cloneTrigger = cloneElement(trigger, {
        onClick: () => handleToggle()
    })

    const handleSubmit = () => {
        setIsLoading(true)
        try {
            form.validateFields().then(async (values) => {
                await onSubmit(values)
            })
            setIsLoading(false)
            handleToggle()
        } catch (error) {
            setIsLoading(false)
        }
    }

    return (
        <Fragment>
            {cloneTrigger}
            <Modal
                title="Создание рассылки"
                open={open}
                okText='Отправить'
                cancelText='Закрыть'
                onCancel={handleToggle}
                confirmLoading={isLoading}
                onOk={handleSubmit}
            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={initialValues}
                >
                    <Form.Item label="Текст" name="text">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item label="Категории" name="categories_ids">
                        <Select
                            mode='multiple'
                            maxTagCount="responsive"
                            options={categoryOptions}
                        />
                    </Form.Item>
                    <Form.Item label="Тэги" name="tags_ids">
                        <Select
                            mode='multiple'
                            maxTagCount="responsive"
                            options={tagsOptions}
                        />
                    </Form.Item>
                    <Form.Item name="skipBlocked" valuePropName="checked">
                        <Checkbox>
                            Пропустить заблокированных
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export { SendingCreate }