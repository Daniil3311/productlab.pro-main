import { useFieldArray, Controller } from "react-hook-form";

import { VariantsFormList } from "./VariantsFormList";
import { Col, Row, Input, Button, Typography, Space } from "antd";

import { PlusOutlined } from '@ant-design/icons'



const QuestionsFormList = ({ control, register, defaultValues }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions"
    });

    const handleAddQuestion = () => append(defaultValues.questions[0])


    return <Row gutter={[0, 16]}>
        {fields.map((item, index) => {
            return <Col span={24} key={item.id} className="survey-item">
                <Row gutter={[0, 16]}>
                    <Col span={24}>
                        <Typography.Text className="survey-label">Вопрос</Typography.Text>
                        <Space.Compact block size="large" >
                            <Controller
                                render={({ field }) => <Input style={{
                                    width: '160%'
                                }} {...field} />}
                                name={`questions[${index}].text`}
                                control={control}
                                defaultValue={item.text}
                            />
                            <Controller
                                render={({ field }) => <Input placeholder="Подсказка" {...field} />}
                                name={`questions[${index}].hint`}
                                control={control}
                                defaultValue={item.hint}
                            />

                        </Space.Compact>
                    </Col>
                    <Col span={24}>
                        <Typography.Text className="survey-label">Варианты ответа</Typography.Text>
                        <VariantsFormList nestIndex={index} {...{ control, register }} />
                    </Col>
                    {index !== 0 &&
                        <Col span={24}>
                            <Space>
                                <Button danger onClick={() => remove(index)}>
                                    Удалить
                                </Button>
                            </Space>
                        </Col>
                    }
                </Row>
            </Col>
        })}
        <Col span={24}>
            <Button icon={<PlusOutlined />} onClick={handleAddQuestion}>Добавить вопрос</Button>
        </Col>
    </Row >
}

export { QuestionsFormList }