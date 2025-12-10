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
  DatePicker,
  InputNumber,
} from "antd";
import vesselService from "../../services/vesselService";
import terminalService from "../../services/terminalService";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const VesselScheduleForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [vessels, setVessels] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState({
    vessels: false,
    terminals: false,
  });

  useEffect(() => {
    fetchVessels();
    fetchTerminals();
  }, []);

  useEffect(() => {
    if (initialValues) {
      // Convert date strings to dayjs objects for DatePicker
      const formValues = {
        ...initialValues,
        gateOpen: initialValues.gateOpen ? dayjs(initialValues.gateOpen) : null,
        cutOff: initialValues.cutOff ? dayjs(initialValues.cutOff) : null,
        etaDt: initialValues.etaDt ? dayjs(initialValues.etaDt) : null,
        etdDt: initialValues.etdDt ? dayjs(initialValues.etdDt) : null,
        nextPortArrivalDt: initialValues.nextPortArrivalDt
          ? dayjs(initialValues.nextPortArrivalDt)
          : null,
        pcDt: initialValues.pcDt ? dayjs(initialValues.pcDt) : null,
        sobDt: initialValues.sobDt ? dayjs(initialValues.sobDt) : null,
        ataDt: initialValues.ataDt ? dayjs(initialValues.ataDt) : null,
        imDt: initialValues.imDt ? dayjs(initialValues.imDt) : null,
        lineIgmDt: initialValues.lineIgmDt
          ? dayjs(initialValues.lineIgmDt)
          : null,
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const fetchVessels = async () => {
    try {
      setLoading((prev) => ({ ...prev, vessels: true }));
      const response = await vesselService.getAllVessels({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setVessels(response.data || []);
      } else {
        message.error("Failed to fetch vessels");
      }
    } catch (error) {
      console.error("Error fetching vessels:", error);
      message.error("Failed to fetch vessels");
    } finally {
      setLoading((prev) => ({ ...prev, vessels: false }));
    }
  };

  const fetchTerminals = async () => {
    try {
      setLoading((prev) => ({ ...prev, terminals: true }));
      const response = await terminalService.getAllTerminals({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setTerminals(response.data || []);
      } else {
        message.error("Failed to fetch terminals");
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      message.error("Failed to fetch terminals");
    } finally {
      setLoading((prev) => ({ ...prev, terminals: false }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Convert dayjs objects back to ISO strings
      const submitValues = {
        ...values,
        gateOpen: values.gateOpen ? values.gateOpen.toISOString() : null,
        cutOff: values.cutOff ? values.cutOff.toISOString() : null,
        etaDt: values.etaDt ? values.etaDt.toISOString() : null,
        etdDt: values.etdDt ? values.etdDt.toISOString() : null,
        nextPortArrivalDt: values.nextPortArrivalDt
          ? values.nextPortArrivalDt.toISOString()
          : null,
        pcDt: values.pcDt ? values.pcDt.toISOString() : null,
        sobDt: values.sobDt ? values.sobDt.toISOString() : null,
        ataDt: values.ataDt ? values.ataDt.toISOString() : null,
        imDt: values.imDt ? values.imDt.toISOString() : null,
        lineIgmDt: values.lineIgmDt ? values.lineIgmDt.toISOString() : null,
      };
      await onSubmit(submitValues);
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
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Vessel"
            name="vesselId"
            rules={[{ required: true, message: "Please select a vessel" }]}
          >
            <Select
              placeholder="Select vessel"
              showSearch
              loading={loading.vessels}
              filterOption={(input, option) => {
                const vessel = vessels.find((v) => v.id === option.value);
                if (!vessel) return false;
                const searchableText = `${vessel.name} ${
                  vessel.imoNumber || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {vessels.map((vessel) => (
                <Option key={vessel.id} value={vessel.id}>
                  {vessel.name} {vessel.imoNumber && `(${vessel.imoNumber})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Voyage"
            name="voyage"
            rules={[
              { max: 100, message: "Voyage cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter voyage number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Service Name"
            name="serviceName"
            rules={[
              {
                max: 255,
                message: "Service name cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter service name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Call Sign"
            name="callSign"
            rules={[
              { max: 50, message: "Call sign cannot exceed 50 characters" },
            ]}
          >
            <Input placeholder="Enter call sign" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Gate Open" name="gateOpen">
            <DatePicker
              showTime
              placeholder="Select gate open time"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Cut Off" name="cutOff">
            <DatePicker
              showTime
              placeholder="Select cut off time"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="ETA (Estimated Time of Arrival)" name="etaDt">
            <DatePicker
              showTime
              placeholder="Select ETA"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="ETD (Estimated Time of Departure)" name="etdDt">
            <DatePicker
              showTime
              placeholder="Select ETD"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="ATA (Actual Time of Arrival)" name="ataDt">
            <DatePicker
              showTime
              placeholder="Select ATA"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="SOB Date" name="sobDt">
            <DatePicker
              showTime
              placeholder="Select SOB date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Pickup Location"
            name="pickupLocation"
            rules={[
              {
                max: 255,
                message: "Pickup location cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter pickup location" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Pickup Terminal" name="pickupTerminalId">
            <Select
              placeholder="Select pickup terminal"
              showSearch
              allowClear
              loading={loading.terminals}
              filterOption={(input, option) => {
                const terminal = terminals.find((t) => t.id === option.value);
                if (!terminal) return false;
                return (
                  terminal.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {terminals.map((terminal) => (
                <Option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Next Port Location"
            name="nextPortLocation"
            rules={[
              {
                max: 255,
                message: "Next port location cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter next port location" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Next Port Terminal" name="nextPortTerminalId">
            <Select
              placeholder="Select next port terminal"
              showSearch
              allowClear
              loading={loading.terminals}
              filterOption={(input, option) => {
                const terminal = terminals.find((t) => t.id === option.value);
                if (!terminal) return false;
                return (
                  terminal.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {terminals.map((terminal) => (
                <Option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Next Port Arrival" name="nextPortArrivalDt">
            <DatePicker
              showTime
              placeholder="Select next port arrival"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="TBA"
            name="tba"
            rules={[{ max: 100, message: "TBA cannot exceed 100 characters" }]}
          >
            <Input placeholder="Enter TBA" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="20ft Space" name="space20ft">
            <InputNumber
              placeholder="Enter 20ft space"
              min={0}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="40ft Space" name="space40ft">
            <InputNumber
              placeholder="Enter 40ft space"
              min={0}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="PC Number"
            name="pcNum"
            rules={[
              { max: 100, message: "PC number cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter PC number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="PC Date" name="pcDt">
            <DatePicker
              showTime
              placeholder="Select PC date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="IM Number"
            name="imNum"
            rules={[
              { max: 100, message: "IM number cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter IM number" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="IM Date" name="imDt">
            <DatePicker
              showTime
              placeholder="Select IM date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="IMO Code"
            name="imoCode"
            rules={[
              { max: 50, message: "IMO code cannot exceed 50 characters" },
            ]}
          >
            <Input placeholder="Enter IMO code" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Line Code"
            name="lineCode"
            rules={[
              { max: 50, message: "Line code cannot exceed 50 characters" },
            ]}
          >
            <Input placeholder="Enter line code" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Line IGM Number"
            name="lineIgmNum"
            rules={[
              {
                max: 100,
                message: "Line IGM number cannot exceed 100 characters",
              },
            ]}
          >
            <Input placeholder="Enter line IGM number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Line IGM Date" name="lineIgmDt">
            <DatePicker
              showTime
              placeholder="Select line IGM date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="SOB Description"
            name="sobDescription"
            rules={[
              {
                max: 500,
                message: "SOB description cannot exceed 500 characters",
              },
            ]}
          >
            <TextArea placeholder="Enter SOB description" rows={3} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ATA Description"
            name="ataDescription"
            rules={[
              {
                max: 500,
                message: "ATA description cannot exceed 500 characters",
              },
            ]}
          >
            <TextArea placeholder="Enter ATA description" rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Vessel Schedule
          </Button>
          <Button onClick={handleReset}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default VesselScheduleForm;
