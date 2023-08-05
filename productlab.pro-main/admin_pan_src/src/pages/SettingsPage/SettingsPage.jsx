import React from 'react';

import { Button, Space, Input, message } from 'antd';

import axios from 'axios';

import { API_URL } from '../../api/api';

class SettingsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded1: false,
            loaded2: false
        }

    }

    componentDidMount() {

        axios({
            url: `${API_URL}/api/token_tablecrm`,
            method: 'get',
            headers: {
                token: this.props.token
            },
        })
            .then(response => {
                this.setState({ startTA: response.data, loaded1: true })
            })


        axios({
            url: `${API_URL}/api/token_useragentcc`,
            method: 'get',
            headers: {
                token: this.props.token
            },
        })
            .then(response => {
                this.setState({ startUA: response.data, loaded2: true })
            })

    }

    updateUA = () => {
        if (this.state.ua) {

            axios({
                url: `${API_URL}/api/token_useragentcc`,
                method: 'put',
                headers: {
                    token: this.props.token
                },
                data: {
                    data: this.state.ua
                }
            })
                .then(response => {
                    message.success(`Токен успешно обновлен!`)
                })

                .catch((error) => message.error(`Ошибка ${error.response.status}`))
        }

        else {
            message.warn(`Вы не сделали изменений токена!`)
        }
    }

    updateTA = () => {
        if (this.state.tablecrm) {

            axios({
                url: `${API_URL}/api/token_tablecrm`,
                method: 'put',
                headers: {
                    token: this.props.token
                },
                data: {
                    data: this.state.tablecrm
                }
            })
                .then(response => {
                    message.success(`Токен успешно обновлен!`)
                })

                .catch((error) => message.error(`Ошибка ${error.response.status}`))
        }
        else {
            message.warn(`Вы не сделали изменений токена!`)
        }

    }

    render() {

        return (
            this.state.loaded1 && this.state.loaded2 ? <div>
                <Space size={"large"} direction="horizontal">
                    Токен user-agent.cc
                    <Input defaultValue={this.state.startUA} onChange={(e) => this.setState({ ua: e.target.value })} style={{ width: 650 }} placeholder="Введите токен user-agent.cc" />
                    <Button onClick={this.updateUA}>
                        Обновить токен
                    </Button>
                </Space>
                <br />
                <br />
                <Space size={"large"} direction="horizontal">
                    Токен tablecrm.com
                    <Input defaultValue={this.state.startTA} onChange={(e) => this.setState({ tablecrm: e.target.value })} style={{ width: 650 }} placeholder="Введите токен tablecrm.com" />
                    <Button onClick={this.updateTA}>
                        Обновить токен
                    </Button>
                </Space>
            </div> : null
        )
    }

}

export { SettingsPage };
