import { useEffect, useState } from 'react';

import { useParams, Link } from "react-router-dom";

import { useSelector } from 'react-redux';
import { userConstants } from '../../store/slices/userSlice';

import { getArticleByCategoryId } from '../../api/api';

import { ErrorMessage, ArticleCard } from '../../components';
import { Row, Col, Button } from 'antd';


const STATUS = {
    loading: "loading",
    success: "success",
    error: "error"
}


const ArticlePage = ({ token }) => {
    const { id } = useParams()

    const [data, setData] = useState([])
    const [status, setStatus] = useState(STATUS.loading)
    const [error, setError] = useState(null)

    const userRole = useSelector((state) => state.user.data?.role)

    useEffect(() => {
        const initial = async () => {
            await getArticleByCategoryId(id).then((data) => {
                setData(data.result)
                setStatus(STATUS.success)
            }).catch((error) => {
                setError({
                    title: error?.code,
                    description: error?.message
                })
                setStatus(STATUS.error)
            })
        }

        initial()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (status === STATUS.error) {
        return <ErrorMessage title={error?.title} description={error?.description} token={token} />
    }

    return (
        <Row gutter={[0, 24]} className='article-page'>
            {userRole === userConstants.role.ADMIN &&
                <Col span={24}>
                    <Link to={`/new?token=${token}`}>
                        <Button>
                            Новая статья
                        </Button>
                    </Link>
                </Col>
            }
            <Col span={24}>
                <Row gutter={[16, 16]}>
                    {data.map((article) => (
                        <Col key={article.id} xs={24} sm={12} md={8} xl={6}>
                            <ArticleCard data={article} userRole={userRole} token={token} />
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>
    )
}

export { ArticlePage }