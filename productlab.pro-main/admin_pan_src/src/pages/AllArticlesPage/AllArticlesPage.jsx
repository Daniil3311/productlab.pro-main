import { useEffect, useState } from 'react';

import { Link } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { userConstants } from "../../store/slices/userSlice"

import { ArticlesList } from '../../components/ArticlesList/ArticlesList';

import { Row, Col, Button, Spin } from 'antd';
import { getArticle } from '../../api/api'

import { setAllData } from '../../store/slices/articleSlice';
import { ErrorMessage } from '../../components';

const STATUS = {
  loading: 'loading',
  error: 'error',
  success: 'success'
}

const AllArticlesPage = ({ token }) => {
  const dispatch = useDispatch()

  const userRole = useSelector((state) => state.user.data?.role)
  const data = useSelector((state) => state.article.allData)

  const [status, setStatus] = useState(STATUS.success)

  const [error, setError] = useState(null)


  useEffect(() => {
    const initial = async () => {
      await getArticle({
        show_unpublic: true
      }).then((data) => {
        dispatch(setAllData(data?.result || []))
        setStatus(STATUS.success)
      })
        .catch((error) => {
          setStatus(STATUS.error)
          setError(error)
        })
    }

    if (!data.length) {
      initial()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === STATUS.error) {
    return <ErrorMessage title={error?.code} description={error?.message} />
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
        <Spin spinning={status === STATUS.loading}>
          <ArticlesList data={data} token={token} userRole={userRole} />
        </Spin>
      </Col>
    </Row>
  )
}

export { AllArticlesPage }