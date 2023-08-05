import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

import './Loader.css'



const Loader = ({ isPage = false }) => {
    return <div className={`loader ${isPage ? "loader__page" : ""}`}>
        <Spin indicator={
            <LoadingOutlined
                style={{
                    fontSize: isPage ? 48 : 24,
                }}
                spin
            />
        } />
    </div>
}
export { Loader };