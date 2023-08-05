import React, { Component } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Image, Modal, Form, Button, Space, Upload, Input, Select, message, Checkbox } from 'antd';
import axios from 'axios';
import { DebounceSelect } from "..";

import { API_URL } from '../../api/api';

const { TextArea } = Input;

const formItemLayout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 19,
    },
};

const normFile = (e) => {
    if (Array.isArray(e)) {
        return e;
    }
    // return e?.fileList;
};

const tailLayout = {
    wrapperCol: {
        offset: 15,
        span: 15,
    },
};

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

class EditUser extends Component {

    constructor(props) {
        super(props);

        this.formRef = React.createRef();

        this.state = {
            isModalOpen: false,
            previewOpen: false,
            previewImage: null,
            new_ava: null
        }

    }

    showModal = () => {
        this.setState({
            isModalOpen: true
        });
    }

    handleCancel = () => {
        this.setState({
            isModalOpen: false
        });
    }

    dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
            // setMainPic(file);
            this.setState({
                new_ava: file
            })
        }, 0);
    };

    onFinish = (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("role", values.role);
        formData.append("about", values.about);
        formData.append("is_dismissed", values.is_dismissed);

        if (this.state.new_ava) {
            formData.append("profile_pic", this.state.new_ava);
        }

        if (values.fetch_tags && values.fetch_tags.length !== 0) {
            for (var i = 0; i < values.fetch_tags.length; i++) {
                if (values.fetch_tags[i].title === "new") {
                    formData.append('tags', `newtag_${values.fetch_tags[i].value}`);
                } else {
                    formData.append('tags', values.fetch_tags[i].value);
                }
            }
        }

        if (values.fetch_categories && values.fetch_categories.length !== 0) {
            for (var j = 0; j < values.fetch_categories.length; j++) {
                if (values.fetch_categories[j].title === "new") {
                    formData.append('category', `newcategory_${values.fetch_categories[j].value}`);
                } else {
                    formData.append('category', values.fetch_categories[j].value);
                }
            }
        }

        axios.patch(`${API_URL}/api/user/${this.props.user_info.id}`, formData, {
            headers: {
                "token": this.props.token,
            },
        })
            .then(response => {
                this.setState({
                    isModalOpen: false
                });
                message.success("Вы успешно изменили пользователя!")
            })
            .catch((error) => message.error(`Ошибка ${error.response.status}`));

    }

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewOpen: true,
            previewImage: file.url || file.preview
        })
    };

    handleCancelPr = () => {
        this.setState({
            previewOpen: false,
        })
    }

    fetch = async (link, param) => {
        link = param ? link + `?name=${param}` : link
        return fetch(link, { headers: { "token": this.state.token } })
            .then((response) => response.json())
            .then((body) => {
                return body
            })
            .then((body) =>
                body.items.map((_param) => ({
                    label: `${_param.name}`,
                    value: _param.id
                })
                )
            )
            .then((body) => {
                return body
            })
    }

    fetchCategories = async (category) => {
        return await this.fetch(`${API_URL}/api/category_for_user/`, category)
    }

    fetchTags = async (tag) => {
        return await this.fetch(`${API_URL}/api/tag_for_user/`, tag)
    }

    render() {
        return (
            <>
                <EditOutlined onClick={this.showModal} />

                <Modal destroyOnClose onCancel={this.handleCancel} footer={null} width={600}
                    title={`Редактирование пользователя ${this.props.user_info.name}`} open={this.state.isModalOpen}>
                    <Form
                        name="validate_other"
                        {...formItemLayout}
                        ref={this.formRef}
                        onFinish={this.onFinish}
                        initialValues={{
                            'name': this.props.user_info.name,
                            'role': this.props.user_info.role,
                            'about': this.props.user_info.about,
                            'is_dismissed': this.props.user_info.is_dismissed,
                            'profile_pic': {
                                url: this.props.profile_pic
                            },
                            'fetch_categories': this.props.user_info.category.map((c) => {
                                return { "label": c.name, "value": c.id }
                            }),
                            'fetch_tags': this.props.user_info.tags.map((c) => {
                                return { "label": c.name, "value": c.id }
                            }),
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="Имя"
                        >
                            <Input placeholder='Введите имя пользователя' />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Роль"
                        >
                            <Select
                                options={[
                                    { value: "ADMIN", label: "Администратор" },
                                    { value: "COPYWRITER", label: "Копирайтер" },
                                    { value: "MANAGER", label: "Менеджер" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="about"
                            label="О вас"
                        >
                            <TextArea placeholder='Расскажите подробнее о себе' />
                        </Form.Item>

                        <Form.Item
                            label="Категории"
                            name="fetch_categories"
                        >
                            <DebounceSelect
                                mode="multiple"
                                service="productlab"
                                placeholder="Выберите категории"
                                fetchOptions={this.fetchCategories}
                                removeIcon={null}
                                onChange={(newValue) => {
                                    this.formRef.current.setFieldsValue({
                                        fetch_categories: newValue,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Тэги"
                            name="fetch_tags"
                        >
                            <DebounceSelect
                                mode="multiple"
                                service="productlab"
                                placeholder="Выберите тэги"
                                fetchOptions={this.fetchTags}
                                removeIcon={null}
                                onChange={(newValue) => {
                                    this.formRef.current.setFieldsValue({
                                        fetch_tags: newValue,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Уволен"
                            name="is_dismissed"
                            valuePropName="checked"
                        >
                            <Checkbox />
                        </Form.Item>

                        <Form.Item label="Аватарка">
                            <Form.Item getValueFromEvent={normFile} noStyle>
                                <Space direction='horizontal'>
                                    <Image
                                        width={100}
                                        src={this.props.profile_pic}
                                    />
                                    <Upload onPreview={this.handlePreview} listType="picture-card" name="files"
                                        customRequest={this.dummyRequest} accept=".jpg, .jpeg, .png" maxCount={1}>
                                        Загрузить...
                                    </Upload>
                                </Space>
                                <Modal title={"Превью новой аватарки"} open={this.state.previewOpen} footer={null}
                                    onCancel={this.handleCancelPr}>
                                    <img
                                        alt="example"
                                        style={{
                                            width: '100%',
                                        }}
                                        src={this.state.previewImage}
                                    />
                                </Modal>
                            </Form.Item>
                        </Form.Item>

                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit" style={{ marginRight: 5 }}>
                                Подтвердить
                            </Button>
                            <Button htmlType="button" onClick={this.handleCancel}>
                                Отмена
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        );
    }
}

export { EditUser };