
import { useCallback } from 'react'

import { postNewSurvey } from '../../api/api'

import { SurveyForm, BackButton } from '../../components'
import { Row, Col, } from 'antd'

import { useNavigate } from 'react-router-dom'


const CreateSurveyPage = ({ token }) => {
    const navigate = useNavigate()

    const onSubmit = useCallback(async (data) => {
        await postNewSurvey(data.module_id, data.lesson_id, data.name, data.description, token, {
            qna: {
                questions: data.questions,
            },
            conditions: {
                conditions: data.conditions
            }
        })

        navigate(`/surveys/edit/all/?token=${token}`)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <BackButton link={`/surveys/edit/all/?token=${token}`}>
                    Вернуться к опросам
                </BackButton>
            </Col>
            <Col span={24} className='container-center'>
                <SurveyForm onSubmit={onSubmit} title='Создание опроса' />
            </Col>
        </Row>
    )
}

export { CreateSurveyPage }