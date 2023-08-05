import React from "react";

import { Card as AntdCard } from "antd";

import "./Card.css";

export const VARIANTS = {
  primary: "primary",
  secondary: "secondary",
};

const Card = ({ data, onSubmit, variant = VARIANTS.primary }) => {
  return (
    <AntdCard
      onClick={() => onSubmit(data?.id)}
      className={`card card__${variant}`}
      cover={
        <img
          className="card__image"
          alt="example"
          src={data?.image}
          loading="lazy"
          placeholder="blur"
        />
      }
    >
      <AntdCard.Meta title={data?.title} description={data?.description} />
    </AntdCard>
  );
};

export { Card };
