import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { Button, Col, Result, Row, Typography } from "antd";

import { Card, VARIANTS, Player } from "../../components";

import { getArticleByCategoryId } from "../../api/api";

import no_image from "../../images/no_main.png";

import "./AcademyArticlePage.css";

import { API_URL } from "../../api/api";

const STATUS = {
    success: "success",
    error: "error",
    nullable: "nullable",
    loading: "loading",
};


const url = API_URL + "/"


const AcademyArticlePage = ({ token }) => {
    const { category_id, progress, article_id } = useParams();

    console.log(category_id, progress, article_id)

    const navigate = useNavigate();
    const defaultSeconds = useMemo(() => Number(progress) || 0, [progress]);

    const [status, setStatus] = useState(STATUS.loading);

    const [articles, setAticles] = useState([]);


    const selectedArticle = useMemo(() => {
        return articles.find((article) => article.id === Number(article_id));
    }, [article_id, articles]);

    const isImageMainPic = useMemo(() => {
        if (selectedArticle) {

            if (!selectedArticle?.main_pic) {
                return true
            }
            const picSplit = selectedArticle?.main_pic.split(".")

            const format = picSplit[picSplit.length - 1]

            if (format === 'jpg' || format === "jpeg" || format === "png" || format === "svg") {
                return true
            }

            return false
        }

        return false

    }, [selectedArticle])

    const onChangeProgress = useCallback(
        (seconds) => {
            const currentSeconds = seconds.toFixed(0);

            navigate(
                `/academy/${category_id}/${article_id}/${currentSeconds}/?token=${token}`,
                {
                    replace: true,
                }
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [category_id, article_id, token]
    );

    const articlesList = useMemo(() => {
        return articles.map((article) => {
            return {
                title: article.title,
                id: article.id,
                description: article?.first_sentence,
                image: article.header_pic ? url + article.header_pic : no_image,
            };
        });
    }, [articles]);

    const handleSelect = useCallback(
        (article_id, options) => {
            navigate(
                `/academy/${category_id}/${article_id}/${defaultSeconds}/?token=${token}`,
                options
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [category_id, article_id, defaultSeconds, token]
    );

    useEffect(() => {
        const initial = async () => {
            await getArticleByCategoryId(category_id, token)
                .then((data) => {
                    if (!data.result.length) {
                        return setStatus(STATUS.nullable);
                    }
                    setAticles(data.result);
                    if (article_id === "null") {
                        handleSelect(data.result[0].id, {
                            replace: true,
                        });
                    }
                    setStatus(STATUS.success);
                })
                .catch((rej) => {
                    setStatus(STATUS.error);
                });
        };

        initial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category_id, article_id, token]);

    if (status === STATUS.nullable) {
        return (
            <Result
                status="404"
                title="Видео не существует!"
                subTitle="Извините, но видео по данной категории не существует."
                extra={
                    <Button onClick={() => navigate(`/academy/?token=${token}`)}>
                        Вернуться обратно
                    </Button>
                }
            />
        );
    }

    if (status === STATUS.error) {
        return (
            <Result
                status="error"
                title="Ошибка!"
                subTitle="На этой странице возникла ошибка"
                extra={
                    <Button onClick={() => navigate(`/academy/?token=${token}`)}>
                        Вернуться обратно
                    </Button>
                }
            />
        );
    }

    return (
        <Row gutter={[16, 32]} className="academy">
            <Col xs={24} lg={17}>
                {selectedArticle &&
                    <Row className="article__video--container">
                        <Col span={24} className="article__video">
                            {selectedArticle?.main_pic && (isImageMainPic ?
                                // eslint-disable-next-line jsx-a11y/alt-text
                                <img loading="eager" fetchpriority='high' placeholder="blur" src={url + selectedArticle?.main_pic} alt='main_pic' />
                                : <Player
                                    onChangeProgress={onChangeProgress}
                                    defaultPlayedSeconds={defaultSeconds}
                                    url={url + selectedArticle?.main_pic}
                                />)
                            }
                        </Col>
                        <Col className="article__actions">
                            <Typography.Title
                                className="article__title"
                                level={3}
                                style={{ margin: 0 }}
                            >
                                {selectedArticle?.title}
                            </Typography.Title>
                            <div
                                className="article__description"
                                dangerouslySetInnerHTML={{ __html: selectedArticle?.content }}
                            ></div>
                        </Col>
                    </Row>
                }
            </Col>
            <Col xs={24} lg={7}>
                <Row gutter={[0, 16]}>
                    <Col span={24}>
                        <Link to={`/surveys/view/${category_id}/?token=${token}`}>
                            <Button>Перейти к опросу</Button>
                        </Link>
                    </Col>
                    {articlesList.map((article) => {
                        return (
                            <Col span={24} key={article?.id}>
                                <Card
                                    data={article}
                                    onSubmit={handleSelect}
                                    variant={VARIANTS.secondary}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </Col>
        </Row>
    );
};

export { AcademyArticlePage };
