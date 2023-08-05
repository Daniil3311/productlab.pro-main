
import { Fragment, useEffect } from "react"

import { getSurveys } from "../../api/api"

import { Row, Col, Button, Typography } from "antd"

import { Link, useParams } from "react-router-dom"

import { Space, Table } from 'antd';

import { useDispatch, useSelector } from "react-redux";

import { setData, setStatus, setError, surveysConstants } from '../../store/slices/surveysSlice'

import { ErrorMessage } from "../../components";

const surveyType = {
    EDIT: 'edit',
    VIEW: 'view'
}


const SurveysPage = ({ token }) => {
    const { type, category_ids } = useParams()
    const dispatch = useDispatch()
    const { data, status, error } = useSelector(state => state.surveys)

    const columns = [
        {
            title: "ID опроса",
            dataIndex: 'sid',
            key: 'sid',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: "Название",
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: "Описание",
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Typography.Text
                style={{ width: type === surveyType.EDIT ? 100 : 300 }}
                ellipsis={{ tooltip: text }}
            >
                {text}
            </Typography.Text>,
        },
        {
            title: "ID модуля",
            dataIndex: 'module',
            key: 'module',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: "ID урока",
            dataIndex: 'lesson',
            key: 'lesson',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: 'Действие',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {
                        type === surveyType.EDIT ?
                            <Fragment>
                                <Typography.Link type='danger'>
                                    Удалить
                                </Typography.Link>
                                <Link to={`/surveys/edit-survey/${record?.sid}/?token=${token}`}>Редактировать</Link>
                            </Fragment>
                            :
                            <Link to={`/surveys/passage/${record.sid}/?token=${token}`}>
                                Перейти
                            </Link>
                    }
                </Space>
            ),
        },
    ]



    useEffect(() => {
        const initial = async () => {
            dispatch(setStatus(surveysConstants.status.loading))
            await getSurveys(token, category_ids === "all" ? null : category_ids).then((data) => {
                dispatch(setData(data?.surveys))
                dispatch(setStatus(surveysConstants.status.success))
            }).catch((error) => {
                dispatch(setStatus(surveysConstants.status.error))
                dispatch(setError({
                    title: error?.code,
                    description: error?.message
                }))
            })
        }

        initial()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    if (status === surveysConstants.status.error) {
        return <ErrorMessage title={error?.title} description={error?.description} token={token} />
    }

    return (
        <Row gutter={[0, 24]}>
            <Col span={24}>
                <Typography.Title level={3}>Опросы</Typography.Title>
                {type === surveyType.EDIT &&
                    <Space>
                        <Link to={`/surveys/create-survey/?token=${token}`}>
                            <Button type="primary">Создать опрос</Button>
                        </Link>
                        <Link to={`/surveys/registry-answers/?token=${token}`}>
                            <Button>Реестр ответов</Button>
                        </Link>
                    </Space>
                }
            </Col>
            <Col span={24}>
                <Table
                    rowKey="sid"
                    columns={columns}
                    dataSource={data}
                    loading={status === surveysConstants.status.loading}
                />
            </Col>
        </Row>
    )
}

export { SurveysPage }