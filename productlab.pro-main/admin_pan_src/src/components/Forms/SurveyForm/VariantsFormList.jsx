
import { useFieldArray, Controller } from "react-hook-form";

import { Col, Space, Input, InputNumber, Button, Row } from "antd"

import { CloseOutlined, PlusOutlined } from '@ant-design/icons'

import { getRandomInt } from '../../../utils/getRandomInt.js'


const VariantsFormList = ({ nestIndex, control, register }) => {
    const { fields, remove, append } = useFieldArray({
        control,
        name: `questions[${nestIndex}].answers`
    });

    const handleAddVariant = () => {
        append({
            text: `Вариант ${fields.length + 1}`,
            hint: '',
            mark: 0,
            aid: getRandomInt(99999)
        })
    }


    return <Row gutter={[0, 14]}>
        {fields.map((item, index) => {
            return <Col span={24} key={item.id}>
                <Space.Compact block>
                    <Controller
                        render={({ field }) => <Input style={{ width: '160% ' }} {...field} />}
                        name={`questions[${nestIndex}].answers[${index}].text`}
                        control={control}
                        defaultValue={item.text}
                    />
                    <Controller
                        render={({ field }) => <Input placeholder="Подсказка"  {...field} />}
                        name={`questions[${nestIndex}].answers[${index}].hint`}
                        control={control}
                        defaultValue={item.hint}
                    />
                    <Controller
                        render={({ field, fieldState: { invalid } }) =>
                            <InputNumber
                                style={{ width: '40%' }}
                                status={invalid ? "error" : undefined}
                                placeholder="Бал" {...field} />
                        }
                        rules={{ required: true }}
                        name={`questions[${nestIndex}].answers[${index}].mark`}
                        control={control}
                        defaultValue={item.mark}
                    />
                    <Button onClick={() => remove(index)}>
                        <CloseOutlined />
                    </Button>
                </Space.Compact>
            </Col>
        })}
        <Col span={24}>
            <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={handleAddVariant}
            >
                Добавить вариант
            </Button>
        </Col>
    </Row>
}

export { VariantsFormList }