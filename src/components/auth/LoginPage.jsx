import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Checkbox,
  Space,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  TruckOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (values) => {
    setError("");
    setIsLoading(true);

    try {
      await login(values.email, values.password);
      // Navigation will be handled by the auth context
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: "Admin",
      email: "firsttenantadmin@nvocc.com",
      password: "Admin@123",
    },
    {
      role: "Admin",
      email: "secondtenantadmin@nvocc.com",
      password: "Admin@123",
    },
    { role: "Customer", email: "customer@test.com", password: "Customer@123" },
    { role: "Sales", email: "sales@test.com", password: "Sales@123" },
    { role: "Multi-role", email: "multiuser@test.com", password: "Multi@123" },
  ];

  const fillDemoCredentials = (email, password) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e6f7ff 0%, #ffffff 50%, #f9f0ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo and Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Avatar
            size={64}
            icon={<TruckOutlined />}
            style={{
              backgroundColor: "#1677ff",
              marginBottom: 16,
            }}
          />
          <Title level={2} style={{ margin: 0 }}>
            NVOCC Management
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <Button type="link" style={{ padding: 0 }}>
                  Forgot password?
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Credentials */}
        <Card
          size="small"
          title="Demo Credentials"
          style={{
            backgroundColor: "#f0f8ff",
            border: "1px solid #91d5ff",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {demoCredentials.map((cred, index) => (
              <Row key={index} justify="space-between" align="middle">
                <Col>
                  <Text strong>{cred.role}:</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {cred.email}
                  </Text>
                </Col>
                <Col>
                  <Button
                    size="small"
                    type="link"
                    onClick={() =>
                      fillDemoCredentials(cred.email, cred.password)
                    }
                  >
                    Use
                  </Button>
                </Col>
              </Row>
            ))}
          </Space>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            © 2025 NVOCC Management System. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
