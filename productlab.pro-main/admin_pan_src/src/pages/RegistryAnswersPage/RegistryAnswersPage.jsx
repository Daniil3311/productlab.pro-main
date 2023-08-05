import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { BackButton, ErrorMessage } from '../../components'
import { getUserAnswers } from '../../api/api'

import moment from 'moment';

import { Row, Col, Typography, Table, Space, Avatar } from 'antd'

import { UserOutlined } from '@ant-design/icons'
import 'moment/locale/ru'

const STATUS = {
    loading: "loading",
    success: "success",
    error: "error"
}


const RegistryAnswersPage = ({ token }) => {
    const [data, setData] = useState([])

    const [status, setStatus] = useState(STATUS.loading)

    const [error, setError] = useState(null)

    const columns = [
        {
            title: "Пользователь",
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => <Space>
                <Avatar size="small" src={record?.profile_pic ? `https://promo.productlab.pro/api/${record.profile_pic}` : ""} icon={<UserOutlined />} />
                <Typography.Text>{name}</Typography.Text>
            </Space>,
        },
        {
            title: "ID опроса",
            dataIndex: 'survey_id',
            key: 'survey_id',
            render: (id) => <Link to={`/surveys/edit-survey/${id}/?token=${token}`}>{id}</Link>,
        },
        {
            title: "Набранные балы",
            dataIndex: 'current_max_mark',
            key: 'current_max_mark',
            render: (text) => <Typography.Text>{text}</Typography.Text>,
        },
        {
            title: "Дата прохождения",
            dataIndex: 'started_at',
            key: 'started_at',
            sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
            render: (date) => <Typography.Text>{moment(date).locale('ru').format("DD MMM YYYY, HH:MM")}</Typography.Text>,
        },
        {
            title: "Статус опроса",
            dataIndex: 'finished',
            key: 'finished',
            render: (finished) => finished ? <Typography.Text type='success'>Опрос пройден</Typography.Text> : <Typography.Text type='danger'>Опрос не пройден</Typography.Text>
        },
    ]

    useEffect(() => {

        const initial = async () => {
            await getUserAnswers().then((data) => {
                setData(data?.user_answers || [])
                setStatus(STATUS.success)
            }).catch((error) => {
                setStatus(STATUS.error)
                setError({
                    code: error?.code,
                    message: error?.message
                })
            })
        }

        initial()

    }, [])

    if (status === STATUS.error) {
        return <ErrorMessage title={error?.code} description={error?.message} />
    }


    return (
        <Row gutter={[0, 24]}>
            <Col span={24}>
                <BackButton link={`/surveys/edit/all/?token=${token}`}>Опросы</BackButton>
                <Typography.Title level={3}>Реестр ответов</Typography.Title>
            </Col>
            <Col span={24}>
                <Table
                    columns={columns}
                    rowKey="user_answer_id"
                    loading={status === STATUS.loading}
                    dataSource={data}
                />
            </Col>
        </Row>
    )
}

export { RegistryAnswersPage }