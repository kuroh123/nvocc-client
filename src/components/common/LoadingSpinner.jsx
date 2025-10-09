import React from "react";
import { Spin, Typography } from "antd";
import { TruckOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LoadingSpinner = ({ message = "Loading...", size = "large" }) => {
  const antIcon = <TruckOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Spin indicator={antIcon} size={size} />
        <Text type="secondary">{message}</Text>
      </div>
    </div>
  );
};

export default LoadingSpinner;
