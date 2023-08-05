import React, { useEffect, useState } from "react";

import { Button, Form, Modal, Input, Upload, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { DebounceSelect } from "..";
import axios from "axios";

import { API_URL } from "../../api/api";

const { TextArea } = Input;

const FileForm = ({ token, fetchFiles, pageSize }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableToken, setTableToken] = useState(null);
    const [fileList, setFileList] = useState([]);
    const formRef = React.createRef();

    const formItemLayout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 20,
        },
    };

    useEffect(() => {
        axios
            .get(`${API_URL}/api/token_tablecrm`)
            .then((resp) => {
                setTableToken(resp.data);
            });
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        showUploadList: true,
        maxCount: 1,
    };

    const Fetch = async (link, param) => {
        return fetch(param ? link + `?name=${param}` : link, {
            headers: { token: token },
        })
            .then((response) => response.json())
            .then((body) => {
                return body;
            })
            .then((body) =>
                body.items
                    ? body.items.map((_param) => ({
                        label: `${_param.name}`,
                        value: _param.id,
                    }))
                    : body.map((_param) => ({
                        label: `${_param.name}`,
                        value: _param.id,
                    }))
            )
            .then((body) => {
                return body;
            });
    };

    const fetchCategories = async (category) => {
        return await Fetch(
            `${API_URL}/api/files/category`,
            category
        );
    };

    const fetchTags = async (tag) => {
        return await Fetch(`${API_URL}/api/files/tag`, tag);
    };

    const fetchUserList = async (username) => {
        const url = `${API_URL}/api/v1/contragents?token=${tableToken}`;
        return fetch(username ? url + `&name=${username}` : url)
            .then((response) => response.json())
            .then((body) => {
                return body;
            })
            .then((body) =>
                body.result.map((user) => ({
                    label: `${user.name}`,
                    value: user.id,
                }))
            )
            .then((body) => {
                return body;
            });
    };

    const fetchProjectsList = async (project) => {
        const url = `${API_URL}/api/v1/projects?token=${tableToken}`;
        return fetch(project ? url + `&name=${project}` : url)
            .then((response) => response.json())
            .then((body) => {
                return body;
            })
            .then((body) =>
                body.result.map((user) => ({
                    label: `${user.name}`,
                    value: user.id,
                }))
            )
            .then((body) => {
                return body;
            });
    };

    const onFinish = (values) => {
        const formData = new FormData();

        formData.append("description", values.description);
        formData.append("upload_file", fileList[0]);

        if (values.fetch_tags && values.fetch_tags.length !== 0) {
            for (var i = 0; i < values.fetch_tags.length; i++) {
                if (values.fetch_tags[i].title === "new") {
                    formData.append("tags", `newtag_${values.fetch_tags[i].value}`);
                } else {
                    formData.append("tags", values.fetch_tags[i].value);
                }
            }
        }

        if (values.fetch_categories && values.fetch_categories.length !== 0) {
            for (var j = 0; j < values.fetch_categories.length; j++) {
                if (values.fetch_categories[j].title === "new") {
                    formData.append(
                        "category",
                        `newcategory_${values.fetch_categories[j].value}`
                    );
                } else {
                    formData.append("category", values.fetch_categories[j].value);
                }
            }
        }

        if (values.fetch_project_tablecrm) {
            if (values.fetch_project_tablecrm.length !== 0) {
                formData.append(
                    "project_tablecrm",
                    values.fetch_project_tablecrm[0].label
                );
                formData.append(
                    "project_tablecrm_id",
                    values.fetch_project_tablecrm[0].value
                );
            }
        }

        if (values.fetch_client_tablecrm) {
            if (values.fetch_client_tablecrm.length !== 0) {
                formData.append(
                    "client_tablecrm",
                    values.fetch_client_tablecrm[0].label
                );
                formData.append(
                    "client_tablecrm_id",
                    values.fetch_client_tablecrm[0].value
                );
            }
        }

        axios
            .post(`${API_URL}/api/files/upload`, formData)
            .then(() => {
                message.success("Вы успешно создали файл!");
                fetchFiles(1, pageSize);
                setIsModalOpen(false);
            })
            .catch((error) => message.error(`Ошибка ${error.response.status}`));
    };

    return (
        <>
            <Button type="default" onClick={showModal}>
                Создать файл
            </Button>
            <Modal
                title="Создание файла"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose={true}
            >
                <Form
                    name="validate_other"
                    {...formItemLayout}
                    ref={formRef}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="upload_file"
                        label="Файл"
                        rules={[
                            {
                                required: true,
                                message: "Загрузите файл!",
                            },
                        ]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Загрузить файл</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="description" label="Описание">
                        <TextArea placeholder="Описание файла" />
                    </Form.Item>

                    <Form.Item label="Категории" name="fetch_categories">
                        <DebounceSelect
                            mode="multiple"
                            service="productlab"
                            placeholder="Выберите категории"
                            fetchOptions={fetchCategories}
                            removeIcon={null}
                            onChange={(newValue) => {
                                formRef.current.setFieldsValue({
                                    fetch_categories: newValue,
                                });
                            }}
                            style={{
                                width: "100%",
                            }}
                        />
                    </Form.Item>

                    <Form.Item label="Тэги" name="fetch_tags">
                        <DebounceSelect
                            mode="multiple"
                            service="productlab"
                            placeholder="Выберите тэги"
                            fetchOptions={fetchTags}
                            removeIcon={null}
                            onChange={(newValue) => {
                                formRef.current.setFieldsValue({
                                    fetch_tags: newValue,
                                });
                            }}
                            style={{
                                width: "100%",
                            }}
                        />
                    </Form.Item>

                    <Form.Item label="Клиент" name="fetch_client_tablecrm">
                        <DebounceSelect
                            mode="multiple"
                            service="tablecrm"
                            placeholder="Выберите клиента"
                            fetchOptions={fetchUserList}
                            removeIcon={null}
                            onChange={(newValue) => {
                                if (newValue.length <= 1) {
                                    formRef.current.setFieldsValue({
                                        fetch_client_tablecrm: newValue,
                                    });
                                } else {
                                    formRef.current.setFieldsValue({
                                        fetch_client_tablecrm: newValue.slice(-1),
                                    });
                                }
                            }}
                            style={{
                                width: "100%",
                            }}
                        />
                    </Form.Item>

                    <Form.Item label="Проект" name="fetch_project_tablecrm">
                        <DebounceSelect
                            mode="multiple"
                            service="tablecrm"
                            placeholder="Выберите проекта"
                            fetchOptions={fetchProjectsList}
                            removeIcon={null}
                            onChange={(newValue) => {
                                if (newValue.length <= 1) {
                                    formRef.current.setFieldsValue({
                                        fetch_project_tablecrm: newValue,
                                    });
                                } else {
                                    formRef.current.setFieldsValue({
                                        fetch_project_tablecrm: newValue.slice(-1),
                                    });
                                }
                            }}
                            style={{
                                width: "100%",
                            }}
                        />
                    </Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button htmlType="button" onClick={handleCancel}>
                            Отмена
                        </Button>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 5 }}>
                            Подтвердить
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </>
    );
};

export { FileForm };
