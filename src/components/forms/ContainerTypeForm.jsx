import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Space, message, Row, Col } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const ContainerTypeForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
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
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ status: "ACTIVE", type: "DRY_CONTAINER" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter container type name" },
              { max: 255, message: "Name cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Enter container type name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ISO Code"
            name="isoCode"
            rules={[
              { required: true, message: "Please enter ISO code" },
              { max: 20, message: "ISO code cannot exceed 20 characters" },
            ]}
          >
            <Input placeholder="Enter ISO code" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Container Type Category"
            name="type"
            rules={[
              { required: true, message: "Please select container type" },
            ]}
          >
            <Select placeholder="Select container type">
              <Option value="DRY">Dry Container</Option>
              <Option value="REEFER">Reefer Container</Option>
              <Option value="TANK">Tank Container</Option>
              <Option value="FLAT_RACK">Flat Rack</Option>
              <Option value="OPEN_TOP">Open Top</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Notes"
            name="notes"
            rules={[
              { max: 1000, message: "Notes cannot exceed 1000 characters" },
            ]}
          >
            <TextArea
              placeholder="Enter notes about container type (optional)"
              rows={4}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Container Type
          </Button>
          <Button onClick={handleReset}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ContainerTypeForm;
