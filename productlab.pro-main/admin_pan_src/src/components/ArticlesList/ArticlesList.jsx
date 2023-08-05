import { useState, useMemo } from "react"

import { Row, Col, Pagination } from "antd"
import { ArticleCard } from "../ArticleCard/ArticleCard"

const ArticlesList = ({ data = [], token, userRole }) => {

    const [page, setPage] = useState(1)

    const onChangePage = (page) => {
        setPage(page);
    };

    const currentData = useMemo(() => {
        return data.slice(10 * (page - 1), 10 * page)
    }, [data, page])

    return (
        <Row gutter={[16, 16]}>
            {currentData.map((article) => {
                return <Col xs={24} sm={12} md={8} lg={6} key={article?.id}>
                    <ArticleCard data={article} token={token} userRole={userRole} />
                </Col>
            })}
            <Col span={24}>
                <Pagination
                    current={page}
                    onChange={onChangePage}
                    total={data.length}
                    showSizeChanger={false}
                />
            </Col>
        </Row>
    )
}

export { ArticlesList }