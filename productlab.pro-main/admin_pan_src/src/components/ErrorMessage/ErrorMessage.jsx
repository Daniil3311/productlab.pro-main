import React from 'react'

import { Result, Button } from 'antd'

import { Link } from 'react-router-dom'

const ErrorMessage = ({ title = 'Error!', description = "Возникла ошибка", token }) => {
    return (
        <Result
            status="error"
            title={title}
            subTitle={description}
            extra={[
                <Link key="buy" to={token ? `/?token=${token}` : "/"}>
                    <Button>Вернуться на главную</Button>,
                </Link>
            ]}
        />
    )
}
export { ErrorMessage }
