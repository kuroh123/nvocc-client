import React from "react";
import { Form, Input, Select, Button, Space, Row, Col } from "antd";

const { Option } = Select;

const VesselForm = ({
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
        type: "CONTAINER_SHIP",
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Vessel Name"
            name="name"
            rules={[
              { required: true, message: "Please enter vessel name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter vessel name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Vessel Type"
            name="type"
            rules={[{ required: true, message: "Please select vessel type" }]}
          >
            <Select placeholder="Select vessel type">
              <Option value="CONTAINER_SHIP">Container Ship</Option>
              <Option value="BULK_CARRIER">Bulk Carrier</Option>
              <Option value="TANKER">Tanker</Option>
              <Option value="RO_RO">RO-RO</Option>
              <Option value="GENERAL_CARGO">General Cargo</Option>
              <Option value="PASSENGER">Passenger</Option>
              <Option value="OTHER">Other</Option>
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
            {initialValues ? "Update Vessel" : "Create Vessel"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default VesselForm;
