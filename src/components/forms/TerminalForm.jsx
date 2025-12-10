import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Tabs,
} from "antd";
import portService from "../../services/portService";
import countryService from "../../services/countryService";
import DocumentUpload from "../common/DocumentUpload";

const { Option } = Select;
const { TextArea } = Input;

const TerminalForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [ports, setPorts] = useState([]);
  const [loadingPorts, setLoadingPorts] = useState(false);

  useEffect(() => {
    fetchPorts();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const fetchPorts = async () => {
    try {
      setLoadingPorts(true);
      const response = await portService.getAllPorts({
        status: "ACTIVE",
        limit: 1000, // Get all active ports
      });

      if (response.success) {
        setPorts(response.data || []);
      } else {
        message.error("Failed to fetch ports");
      }
    } catch (error) {
      console.error("Error fetching ports:", error);
      message.error("Failed to fetch ports");
    } finally {
      setLoadingPorts(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "ACTIVE",
      }}
    >
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Basic Information",
            children: (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Terminal Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter terminal name",
                        },
                        {
                          max: 255,
                          message:
                            "Terminal name must be less than 255 characters",
                        },
                      ]}
                    >
                      <Input placeholder="Enter terminal name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="portId"
                      label="Port"
                      rules={[
                        { required: true, message: "Please select port" },
                      ]}
                    >
                      <Select
                        placeholder="Select port"
                        loading={loadingPorts}
                        showSearch
                        filterOption={(input, option) => {
                          // Find the port object to get the searchable text
                          const port = ports.find((p) => p.id === option.value);
                          if (!port) return false;

                          const searchableText =
                            `${port.name} ${port.portCode}`.toLowerCase();
                          return (
                            searchableText.indexOf(input.toLowerCase()) >= 0
                          );
                        }}
                      >
                        {ports.map((port) => (
                          <Option key={port.id} value={port.id}>
                            {port.name} ({port.portCode})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[
                        { required: true, message: "Please select status" },
                      ]}
                    >
                      <Select placeholder="Select status">
                        {statusOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Description">
                  <TextArea
                    rows={4}
                    placeholder="Enter description"
                    maxLength={1000}
                  />
                </Form.Item>
              </>
            ),
          },
          {
            key: "2",
            label: "Documents",
            children: (
              <DocumentUpload
                entityType="terminal"
                entityId={initialValues?.id}
                disabled={isLoading}
              />
            ),
          },
        ]}
      />

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Terminal" : "Create Terminal"}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TerminalForm;
