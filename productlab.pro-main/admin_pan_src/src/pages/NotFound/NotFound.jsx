import React from "react";
import { Button, Result } from "antd";

import { Link } from "react-router-dom";

const NotFound = ({ token, role }) => {

    return (
        <Result
            status="404"
            title="404"
            subTitle="Извините страница которую вы посетили не существует."
            extra={
                <Link to={token ? `/?token=${token}` : "/categories"}>
                    <Button>Вернуться на главную</Button>
                </Link>
            }
        />
    );
};

export { NotFound };
