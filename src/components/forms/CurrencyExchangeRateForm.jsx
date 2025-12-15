import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  InputNumber,
  message,
} from "antd";
import currencyService from "../../services/currencyService";
import dayjs from "dayjs";

const { Option } = Select;

const CurrencyExchangeRateForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (initialValues) {
      const formData = {
        ...initialValues,
        validFromDt: initialValues.validFromDt
          ? dayjs(initialValues.validFromDt)
          : null,
      };
      form.setFieldsValue(formData);
    }
  }, [initialValues, form]);

  const fetchCurrencies = async () => {
    try {
      setLoadingCurrencies(true);
      const response = await currencyService.getAllCurrencies({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCurrencies(response.data || []);
      } else {
        message.error("Failed to fetch currencies");
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      message.error("Failed to fetch currencies");
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        validFromDt: values.validFromDt
          ? values.validFromDt.toISOString()
          : undefined,
      };
      await onSubmit(formattedValues);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
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
      autoComplete="off"
      initialValues={{
        status: "ACTIVE",
        validFromDt: dayjs(),
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="From Currency"
            name="fromCurrencyId"
            rules={[{ required: true, message: "Please select from currency" }]}
          >
            <Select
              placeholder="Select from currency"
              loading={loadingCurrencies}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {currencies.map((currency) => (
                <Option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="To Currency"
            name="toCurrencyId"
            rules={[{ required: true, message: "Please select to currency" }]}
          >
            <Select
              placeholder="Select to currency"
              loading={loadingCurrencies}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {currencies.map((currency) => (
                <Option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Exchange Rate"
            name="exchangeRate"
            rules={[
              { required: true, message: "Please enter exchange rate" },
              {
                type: "number",
                min: 0,
                message: "Exchange rate must be positive",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter exchange rate"
              style={{ width: "100%" }}
              precision={6}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Valid From Date"
            name="validFromDt"
            rules={[
              { required: true, message: "Please select valid from date" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Lower Rate (Optional)"
            name="lowerRate"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Lower rate must be positive",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter lower rate"
              style={{ width: "100%" }}
              precision={6}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Upper Rate (Optional)"
            name="upperRate"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Upper rate must be positive",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter upper rate"
              style={{ width: "100%" }}
              precision={6}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
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

      <Form.Item className="text-right">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Exchange Rate" : "Create Exchange Rate"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CurrencyExchangeRateForm;
