import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setData as setCategories } from '../../../store/slices/categoriesSlice'

import { getCategories, getArticleByCategoryId } from "../../../api/api";

import { useForm, Controller } from "react-hook-form";

import { ConditionsList } from "./ConditionsList";
import { QuestionsFormList } from './QuestionsFormList';

import { Row, Col, Select, Space, Typography, Button, Input } from 'antd'

import './SurveyForm.css'

const defaultValues = {
    module_id: null,
    lesson_id: null,
    name: "",
    description: "",
    questions: [{
        text: "Вопрос 1",
        hint: "",
        answers: [{
            text: "Вариант 1",
            hint: '',
            mark: null,
            aid: 0,
        }]
    }],
    conditions: [{
        low_boundary: 0,
        high_boundary: 0,
        action: '',
    }]
}

const SurveyForm = ({ onSubmit = () => { }, data = null, title = 'Форма опроса' }) => {
    const dispatch = useDispatch()
    const categories = useSelector(state => state.categories.data)

    const [articles, setArticles] = useState([])

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue
    } = useForm({
        defaultValues: data ? data : defaultValues
    });


    const categoriesOptions = useMemo(() => {
        return categories.map((category) => ({ label: category?.name, value: category?.id }))
    }, [categories])

    const articlesOptions = useMemo(() => {
        return articles.map((article) => ({ value: article?.id, label: article?.title }))
    }, [articles])

    const handleChangeCategory = async (value) => {
        setValue("lesson_id", null)
        setArticles([])
        await getArticleByCategoryId(value).then((data) => {
            setArticles(data?.result || [])
        })
    }


    useEffect(() => {
        if (!categories.length) {
            getCategories().then((data) => dispatch(setCategories(data)))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Row gutter={[16, 16]}>
                <Col span={24} className="flex justify-content-between align-items-center">
                    <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
                    <Button htmlType="submit" type='primary'>{data ? 'Обновить' : "Создать"}</Button>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 16]} style={{
                        flexWrap: 'wrap-reverse'
                    }}>
                        <Col xs={24} md={12}>
                            <QuestionsFormList {...{ control, register, defaultValues, watch }} />
                        </Col>
                        <Col xs={24} md={12}>
                            <Row gutter={[0, 16]}>
                                <Col span={24} className='survey-item'>
                                    <Row gutter={[0, 16]}>
                                        <Col span={24}>
                                            <Typography.Text className='survey-label'>Название</Typography.Text>
                                            <Controller
                                                render={({ field }) => <Input size="large" {...field} />}
                                                name="name"
                                                control={control}
                                                defaultValue={defaultValues.name}
                                            />
                                        </Col>
                                        <Col span={24}>
                                            <Typography.Text className='survey-label'>Описание</Typography.Text>
                                            <Controller
                                                render={({ field }) => <Input.TextArea size='large' rows={3} {...field} />}
                                                name="description"
                                                control={control}
                                                defaultValue={defaultValues.description}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                {!data &&
                                    <Col span={24} className='survey-item'>
                                        <Typography.Text className='survey-label'>Категории и статьи</Typography.Text>
                                        <Space.Compact block size='large'>
                                            <Controller
                                                render={({ field }) =>
                                                    <Select
                                                        {...field}
                                                        style={{ width: '50%' }}
                                                        defaultValue={field.defaultValue}
                                                        options={categoriesOptions}
                                                        placeholder='Категория'
                                                        onChange={value => {
                                                            field.onChange(value)
                                                            handleChangeCategory(value)
                                                        }}
                                                    />}
                                                defaultValue={defaultValues.module_id}
                                                name="module_id"
                                                control={control}
                                            />
                                            <Controller
                                                render={({ field }) =>
                                                    <Select
                                                        {...field}
                                                        style={{ width: '50%' }}
                                                        defaultValue={field.defaultValue}
                                                        notFoundContent='Выберите категорию'
                                                        placeholder='Статья'
                                                        options={articlesOptions}
                                                    />}
                                                name="lesson_id"
                                                control={control}
                                                defaultValue={defaultValues.lesson_id}
                                            />
                                        </Space.Compact>
                                    </Col>
                                }
                                <Col span={24}>
                                    <ConditionsList  {...{ control, register, defaultValues, watch }} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </form>
    )
}

export { SurveyForm }