import React, { useEffect } from 'react'

import { useNavigate } from 'react-router-dom';

import { setData, setStatus, setError, categoriesConstants } from '../../store/slices/categoriesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { getCategories } from '../../api/api';

import { ErrorMessage } from '../../components';
import no_image from '../../images/no_main.png'

import { Row, Card, Col } from 'antd';

import './CategoriesPage.css'

import { API_URL } from '../../api/api';

const CategoriesPage = ({ token }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { data, status, error } = useSelector(state => state.categories)

    const url = `${API_URL}/api`

    const handleClick = (id) => {
        navigate(`/article/${id}/${token ? `?token=${token}` : ''}`)
    }

    useEffect(() => {
        const initial = async () => {
            dispatch(setStatus(categoriesConstants.status.loading))
            await getCategories(token).then((data) => {
                dispatch(setData(data))
                dispatch(setStatus(categoriesConstants.status.success))
            }).catch((error) => {
                dispatch(setStatus(categoriesConstants.status.error))
                dispatch(setError({
                    title: error?.code,
                    description: error?.message
                }))
            })
        }

        initial()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    if (status === categoriesConstants.status.error) {
        return <ErrorMessage title={error?.title} description={error?.description} token={token} />
    }


    return (
        <Row gutter={[16, 16]}>
            {data.map((category) => {

                const image = category.image ? `${url}/${category.image}` : no_image

                return <Col key={category?.id} xs={24} sm={12} md={8} xl={6}>
                    <Card
                        className='category--card'
                        onClick={() => handleClick(category?.id)}
                        cover={<img alt="category card" height='340px' src={image} />}
                    >
                        <Card.Meta
                            title={category?.name}
                            description={`Количество статей: ${category?.count_articles}`}
                        />
                    </Card>
                </Col>
            })}
        </Row>
    )
}

export { CategoriesPage };