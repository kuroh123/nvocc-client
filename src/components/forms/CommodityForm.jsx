import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Space, message, Row, Col } from "antd";
import cargoService from "../../services/cargoService";

const { Option } = Select;
const { TextArea } = Input;

const CommodityForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [cargos, setCargos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

  useEffect(() => {
    fetchCargos();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const fetchCargos = async () => {
    try {
      setLoadingCargos(true);
      const response = await cargoService.getAllCargo({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCargos(response.data || []);
      } else {
        message.error("Failed to fetch cargos");
      }
    } catch (error) {
      console.error("Error fetching cargos:", error);
      message.error("Failed to fetch cargos");
    } finally {
      setLoadingCargos(false);
    }
  };

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
      initialValues={{ status: "ACTIVE" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter commodity name" },
              { max: 255, message: "Name cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Enter commodity name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Code"
            name="code"
            rules={[{ max: 50, message: "Code cannot exceed 50 characters" }]}
          >
            <Input placeholder="Enter commodity code (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Cargo"
            name="cargoId"
            rules={[{ required: true, message: "Please select a cargo" }]}
          >
            <Select
              placeholder="Select cargo"
              showSearch
              loading={loadingCargos}
              filterOption={(input, option) => {
                const cargo = cargos.find((c) => c.id === option.value);
                if (!cargo) return false;
                const searchableText = `${cargo.name} ${
                  cargo.code || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {cargos.map((cargo) => (
                <Option key={cargo.id} value={cargo.id}>
                  {cargo.name} {cargo.code && `(${cargo.code})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                max: 1000,
                message: "Description cannot exceed 1000 characters",
              },
            ]}
          >
            <TextArea
              placeholder="Enter commodity description (optional)"
              rows={4}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
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

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Commodity
          </Button>
          <Button onClick={handleReset}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CommodityForm;
