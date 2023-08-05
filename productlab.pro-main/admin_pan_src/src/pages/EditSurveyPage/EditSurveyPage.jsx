import React, { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { Row, Col } from 'antd'

import { BackButton, SurveyForm, ErrorMessage, Loader } from '../../components'

import { getSurveysBySid, postUpdateSurvay } from '../../api/api'

const statusConstant = {
    loading: "loading",
    error: 'error',
    nullable: "nullable",
    success: "success"
}


const EditSurveyPage = ({ token }) => {
    const { sid } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [status, setStatus] = useState(statusConstant.loading)
    const [error, setError] = useState(null)

    const currentData = data ? {
        name: data?.name,
        description: data?.description,
        questions: data?.qna?.questions,
        conditions: data?.conditions?.conditions
    } : null

    const onSave = async (values) => {
        setStatus(statusConstant.loading)
        await postUpdateSurvay(sid, values.name, values.description, {
            question_and_answers: {
                questions: values.questions
            },
            conditions: {
                conditions: values.conditions
            }
        }).then(() => {
            navigate(`/surveys/edit/all/?token=${token}`)
        })

        setStatus(statusConstant.success)

    }

    useEffect(() => {
        const initial = async () => {
            setStatus(statusConstant.loading)
            await getSurveysBySid(sid)
                .then((data) => {
                    setData(data)
                    setStatus(statusConstant.success)
                })
                .catch((error) => {
                    setStatus(statusConstant.error)
                    setError({
                        title: error?.code,
                        description: error?.message
                    })
                })
        }

        initial()

    }, [sid])

    if (status === statusConstant.error) {
        return <ErrorMessage title={error?.title} description={error?.description} token={token} />
    }

    if (status === statusConstant.loading) {
        return <Loader isPage />
    }

    return (
        <Row gutter={[0, 24]}>
            <Col span={24}>
                <BackButton link={`/surveys/edit/all/?token=${token}`}>
                    Вернуться к опросам
                </BackButton>
            </Col>
            <Col span={24} className='container-center'>
                <SurveyForm data={currentData} onSubmit={onSave} title={"Редактирование опроса, ID: " + sid} />
            </Col>
        </Row >
    )
}


export { EditSurveyPage }