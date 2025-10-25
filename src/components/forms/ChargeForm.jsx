import React from "react";
import { Form, Input, Select, Button, Space, Row, Col } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const ChargeForm = ({
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
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Charge Name"
            name="name"
            rules={[
              { required: true, message: "Please enter charge name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter charge name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[
              { required: true, message: "Please enter display name" },
              { min: 2, message: "Display name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter display name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="SAC/HSN Code" name="sacHsnCode">
            <Input placeholder="Enter SAC/HSN code" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Flag" name="flag">
            <Input placeholder="Enter flag" />
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

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item label="Note" name="note">
            <TextArea rows={4} placeholder="Enter note" />
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
            {initialValues ? "Update Charge" : "Create Charge"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ChargeForm;
