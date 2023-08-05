import { useFieldArray, Controller } from "react-hook-form";
import { Col, Row, Space, Button, InputNumber, Typography, Input } from "antd"

import { PlusOutlined } from '@ant-design/icons'

const ConditionsList = ({ control, defaultValues }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "conditions"
    });

    const handleAddCondition = () => append(defaultValues.conditions[0])

    return (
        <Row gutter={[0, 16]} >
            {fields.map((item, index) => {
                return <Col span={24} key={item.id} className='survey-item'>
                    <Row gutter={[0, 18]}>
                        <Col span={24}>
                            <Typography.Text className="survey-label">Диапазон балов</Typography.Text>
                            <Space.Compact block>
                                <Controller
                                    rules={{ required: true }}
                                    render={({ field, fieldState: { invalid } }) =>
                                        <InputNumber
                                            placeholder="От"
                                            status={invalid ? "error" : undefined}
                                            {...field}
                                        />
                                    }
                                    name={`conditions[${index}].low_boundary`}
                                    control={control}
                                    defaultValue={item.low_boundary}
                                />
                                <Controller
                                    rules={{ required: true }}
                                    render={({ field, fieldState: { invalid } }) =>
                                        <InputNumber
                                            placeholder="До"
                                            status={invalid ? "error" : undefined}
                                            {...field}
                                        />
                                    }
                                    name={`conditions[${index}].high_boundary`}
                                    control={control}
                                    defaultValue={item.high_boundary}
                                />
                            </Space.Compact>
                        </Col>
                        <Col span={24}>
                            <Typography.Text className="survey-label">Действие</Typography.Text>
                            <Controller
                                render={({ field }) => <Input placeholder="open module 2 1" {...field} />}
                                name={`conditions[${index}].action`}
                                control={control}
                                defaultValue={item.action}
                            />
                        </Col>
                        {index !== 0 && <Col span={24}>
                            <Button danger onClick={() => remove(index)}>Удалить</Button>
                        </Col>}
                    </Row>
                </Col>
            })}
            <Col span={24}>
                <Button icon={<PlusOutlined />} onClick={handleAddCondition}>Добавить действие</Button>
            </Col>
        </Row>
    )
}

export { ConditionsList }