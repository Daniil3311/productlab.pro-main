import React, { Component } from 'react';
import { Modal } from "antd";

class DismissedPage extends Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal
                title="Вы были уволены"
                open={true}
                footer={[]}
                closable={false}
                centered
            >
                <p>Для продолжения, запросите доступ к порталу</p>
            </Modal>
        )
    }
}

export { DismissedPage };