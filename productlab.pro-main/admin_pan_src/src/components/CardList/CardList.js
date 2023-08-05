import React from "react";

import { Space } from "antd";

import { Card, VARIANTS } from "../Card/Card";

import "./CardList.css";

const CardList = ({ onSubmit, data = [] }) => {
  return (
    <Space className="card-list" direction="horizontal" size={18}>
      {data.map((item) => {
        return (
          <Card
            key={item?.id}
            data={item}
            onSubmit={onSubmit}
            variant={VARIANTS.primary}
          />
        );
      })}
    </Space>
  );
};

export { CardList };
