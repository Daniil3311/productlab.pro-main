
import { Link } from "react-router-dom";

import { userConstants } from "../../store/slices/userSlice"

import no_image from '../../images/no_main.png'

import { Card, Avatar } from 'antd';

import { EyeOutlined, EditOutlined } from '@ant-design/icons'


import { API_URL } from "../../api/api";

import './ArticleCard.css'

const ArticleCard = ({ data, userRole, token }) => {


    const image = data.header_pic ? `${API_URL}/api/${data.header_pic}` : no_image

    const profile_pic = `${API_URL}/api/${data?.owner?.profile_pic}`

    const defaultActions = [
        <a
            target='_blank'
            rel='noopener noreferrer'
            href={`https://productlab.pro/article/${data?.id}`}
        >
            <EyeOutlined />
        </a>,
    ]

    const actions = userRole === userConstants.role.ADMIN ?
        [...defaultActions,
        <Link to={`/edit/?token=${token}&id=${data?.id}`}>
            <EditOutlined />
        </Link>
        ] : defaultActions


    return <Card
        className='article--card'
        bordered={false}
        cover={
            <img
                height='240px'
                src={image}
                placeholder='blur'
                loading="lazy"
                alt="article card img"
            />
        }
        actions={actions}
    >
        <Card.Meta
            avatar={<Avatar src={profile_pic} />}
            title={data?.title || "Нет названия"}
            description={data?.first_sentence || "Нет описания"}
        />
    </Card>
}
export { ArticleCard }