import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import { Row, Card, Upload, message, Button } from "antd";
import { EyeOutlined, PictureOutlined } from "@ant-design/icons";

import no_image from "../../images/no_main.png";

import { API_URL } from "../../api/api";

const { Meta } = Card;

const FileCategories = ({ click, checked, onChange }) => {
    const [categories, setCategories] = useState([])
    const [loaded, setLoaded] = useState(false)
    let navigation = useNavigate()
    let location = useLocation()

    useEffect(() => {
        if (location.pathname === "/files/categories") {
            navigation(location.pathname + location.search)
        } else {
            navigation(location.pathname + "/categories" + location.search)
        }
        fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchCategories = () => {
        axios.get(`${API_URL}/api/files/category`)
            .then(response => {
                if (response.status === 200) {
                    setCategories(response.data)
                    setLoaded(true)
                }
            })
    }

    const onClickCard = (item) => {
        click(!checked)
        onChange(item.id)
    }

    const onImageUpload = () => {
        setLoaded(false)
        fetchCategories()
    }

    return (
        <>
            {loaded ?
                (<Row>
                    {categories.map((item) => {
                        return <Card
                            key={item.id}
                            style={{
                                width: 300,
                                marginBottom: 15,
                                marginLeft: 5
                            }}
                            cover={
                                <img
                                    style={{ width: 300, height: 300 }}
                                    alt="card_cover"
                                    src={item.image ? `${API_URL}/api/${item.image}` : `${no_image} `}
                                />
                            }

                            actions={[
                                <Button icon={<EyeOutlined />} type={"text"} onClick={() => onClickCard(item)} />,
                                <Upload
                                    {...
                                    {
                                        name: "image",
                                        action: `${API_URL} /api/files / category / ${item.id} /image`,
                                        headers: {},
                                        maxCount: 1,
                                        showUploadList: false,
                                        onChange(info) {
                                            if (info.file.status === "done") {
                                                onImageUpload()
                                                message.success("Изображение категории было изменено");
                                            } else if (info.file.status === "error") {
                                                message.error("Ошибка изменения изображения");
                                            }
                                        }
                                    }
                                    }
                                    style={{ width: "100%" }}
                                >
                                    <Button icon={<PictureOutlined />} type={"text"} />
                                </Upload>
                            ]}
                        >
                            <Meta
                                title={item.name}
                                description={`Количество файлов: не указано`}
                            />
                        </Card >
                    })}
                </Row >) : null}
        </>
    )
}

export { FileCategories };
