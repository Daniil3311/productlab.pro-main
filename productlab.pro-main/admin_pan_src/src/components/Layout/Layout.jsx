import React from 'react'

import {
    Link,
} from "react-router-dom";
import { Layout as AntdLayout, Menu } from 'antd'

import { API_URL } from '../../api/api';

import { Loader } from '../index'
import {
    UnorderedListOutlined,
    UserOutlined,
    SettingOutlined,
    FileOutlined,
    CodeOutlined,
    GlobalOutlined,
    BankOutlined,
    GoldOutlined,
    OrderedListOutlined
} from "@ant-design/icons";

import './Layout.css'

import { userConstants } from '../../store/slices/userSlice';

const navigation = [
    {
        link: '',
        title: "Статьи",
        name: "articles",
        icon: <UnorderedListOutlined />
    },
    {
        link: '/categories',
        title: "Категории",
        name: "categories",
        icon: <GoldOutlined />
    },
    {

        link: `${API_URL}/api/docs`,
        title: "API Документация",
        name: "api",
        forwarding: true,
        icon: <CodeOutlined />
    },
    {
        link: process.env.REACT_APP_SITE_URL,
        title: "Сайт",
        name: "site",
        forwarding: true,
        icon: <GlobalOutlined />
    },
    {
        link: '/academy',
        title: "Академия",
        name: "academy",
        icon: <BankOutlined />
    },
    {
        link: '/users',
        title: "Пользователи",
        name: "users",
        icon: <UserOutlined />
    },
    {
        link: '/files',
        title: "Файлы",
        name: "files",
        icon: <FileOutlined />
    },
    {
        link: '/settings',
        title: "Настройки",
        name: "settings",
        icon: <SettingOutlined />
    },
    {
        link: '/surveys/edit/all',
        title: "Опросы",
        name: "surveys",
        icon: <OrderedListOutlined />
    },
]

const menuBasedOnRole = {
    ADMIN: ["articles", "categories", "users", "files", "settings", "api", "site", "academy", 'surveys'],
    MANAGER: ["academy"],
    STUDENT: ["academy"],
    COPYWRITER: ["articles", "categories", "api", "site", "academy"],
    default: ["articles", "categories", "api", "site"],
}


const HeaderMenu = ({ token, role = userConstants.role.default }) => {
    const items = menuBasedOnRole[role].map((item) => {
        const currentItem = navigation.find((n) => n.name === item)

        return {
            label: currentItem.forwarding ?
                (
                    <a target='_blank' href={currentItem.link} rel="noopener noreferrer">
                        {currentItem.title}
                    </a>
                ) : (
                    <Link
                        to={role === userConstants.role.default ? currentItem.link : `${currentItem.link}/?token=${token}`}>
                        {currentItem.title}
                    </Link>
                ),
            key: currentItem.name,
            icon: currentItem.icon
        }
    });


    return <Menu
        theme="light"
        mode="horizontal"
        items={items}
        style={{ width: "100%" }}
    />
}

const Layout = ({ children, user, token }) => {

    const loading = user.status === userConstants.status.loading

    const userRole = user?.data?.role


    return (
        <AntdLayout className='layout'>
            <AntdLayout.Header className='layout__header'>
                <HeaderMenu token={token} role={userRole} />
            </AntdLayout.Header>
            <AntdLayout.Content className='layout__content'>
                {loading ? <Loader isPage /> : children}
            </AntdLayout.Content>
            <AntdLayout.Footer>
                2023 Made by @productlab.pro/blog/team
            </AntdLayout.Footer>
        </AntdLayout>
    )
}

export { Layout }