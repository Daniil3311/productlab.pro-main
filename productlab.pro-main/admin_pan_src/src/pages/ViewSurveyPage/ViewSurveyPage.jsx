import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { getSurveysBySid, postAnswerSurvay } from '../../api/api'

import { ErrorMessage, Loader, SurveyQuestion } from '../../components'

import { Row, Col, Typography } from 'antd'

import './VuewSurveyPage.css'

const STATUS = {
    loading: 'loading',
    nullable: 'nullable',
    error: 'error',
    success: 'success'
}

const ViewSurveyPage = ({ token }) => {
    const { sid } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [status, setStatus] = useState(STATUS.loading)
    const [error, setError] = useState(null)

    const [current, setCurrent] = useState(0);

    const currentQuestion = data?.qna?.questions[current]

    const isLastQuestion = current === data?.qna?.questions.length - 1

    const onSubmit = async (answer_id) => {
        return await postAnswerSurvay(data?.sid, answer_id, token).then(() => {
            setCurrent(prev => prev + 1)

            if (isLastQuestion) {
                navigate(`/academy/?token=${token}`)
            }
        })
    }


    useEffect(() => {
        const initial = async () => {
            setStatus(STATUS.loading)
            await getSurveysBySid(sid)
                .then((data) => {
                    setData(data)
                    setStatus(STATUS.success)
                })
                .catch((error) => {
                    setStatus(STATUS.error)
                    setError({
                        title: error?.code,
                        description: error?.message
                    })
                })
        }
        //example response
        initial()
    }, [sid])

    if (status === STATUS.loading) {
        return <Loader isPage />
    }

    if (status === STATUS.error) {
        return <ErrorMessage title={error?.title} description={error?.description} token={token} />
    }

    return (
        <Row gutter={[0, 16]} className='container-center'>
            <Col span={24}>
                <Typography.Title level={3}>Опрос</Typography.Title>
            </Col>
            <Col span={24}>
                {currentQuestion && <SurveyQuestion data={currentQuestion} onSubmit={onSubmit} isLast={isLastQuestion} />}
            </Col>
        </Row>
    )
}

export { ViewSurveyPage }