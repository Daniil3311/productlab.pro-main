import React from 'react'

import { Button } from 'antd'

import { useNavigate } from 'react-router-dom'

import { ArrowLeftOutlined } from '@ant-design/icons'

const BackButton = ({ link = '/', toBack = false, children }) => {
    const navigate = useNavigate()

    const onClick = () => {
        if (toBack) {
            return navigate(-1)
        }

        navigate(link)
    }

    return (
        <Button type='link' icon={<ArrowLeftOutlined />} style={{
            marginLeft: -15
        }} onClick={onClick}>{children}</Button>
    )
}

export { BackButton }