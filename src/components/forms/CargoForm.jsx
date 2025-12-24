import React from "react";
import { Form, Input, Select, Button, Space, Row, Col } from "antd";

const { Option } = Select;

const CargoForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      initialValues={{
        status: "ACTIVE",
        cargoType: "GENERAL",
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Cargo Name"
            name="name"
            rules={[
              { required: true, message: "Please enter cargo name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter cargo name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Cargo Type"
            name="cargoType"
            rules={[{ required: true, message: "Please select cargo type" }]}
          >
            <Select placeholder="Select cargo type">
              <Option value="GENERAL">General</Option>
              <Option value="BULK">Bulk</Option>
              <Option value="LIQUID">Liquid</Option>
              <Option value="HAZARDOUS">Hazardous</Option>
              <Option value="REFRIGERATED">Refrigerated</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Status" name="status" required>
            <Select placeholder="Select status">
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="text-right">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Cargo" : "Create Cargo"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CargoForm;
