

import { useState } from 'react'
import { Col, Row, Typography, Button, Space, Radio } from "antd"


const SurveyQuestion = ({ data, onSubmit, isLast }) => {
    const [selected, setSelected] = useState(null)

    const [isLoading, setLoading] = useState(false)

    const handleSelect = (e) => {
        setSelected(e.target.value)
    }

    const handleSubmit = async () => {
        setLoading(true)
        await onSubmit(selected)
        setLoading(false)
    }


    return (
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <Typography.Title level={5} style={{ margin: 0 }}>{data?.text}</Typography.Title>
            </Col>
            <Col xs={24} md={12}>
                <Radio.Group style={{ width: '100%' }} onChange={handleSelect} value={selected}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {data?.answers.map((anwer) => {
                            return <Radio className='survey-answer-item' value={anwer?.aid}>
                                <Typography.Text>
                                    {anwer?.text}
                                </Typography.Text>
                            </Radio>
                        })}
                    </Space>
                </Radio.Group>
            </Col>
            <Col span={24}>
                <Button type='primary' loading={isLoading} onClick={handleSubmit} disabled={!selected || isLoading}>{!isLast ? "Ответить" : "Завершить"}</Button>
            </Col>
        </Row>
    )
}

export { SurveyQuestion }