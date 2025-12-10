import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  List,
  message,
  Popconfirm,
  Typography,
  Space,
  Card,
  Empty,
  Spin,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import uploadService from "../../services/uploadService";

const { Text } = Typography;
const { Dragger } = Upload;

/**
 * DocumentUpload Component
 * A reusable component for uploading, viewing, and managing documents
 *
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 * @param {string} entityId - ID of the entity (only required when viewing existing uploads)
 * @param {boolean} disabled - Whether the upload is disabled
 * @param {number} maxFiles - Maximum number of files allowed
 */
const DocumentUpload = ({
  entityType,
  entityId,
  disabled = false,
  maxFiles = 10,
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch existing uploads if entityId is provided
  useEffect(() => {
    if (entityId) {
      fetchUploads();
    }
  }, [entityId]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getEntityUploads(
        entityType,
        entityId
      );
      console.log("Fetch uploads response:", response);
      if (response.success) {
        setUploads(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      message.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };
  console.log("Uploads:", uploads);

  const handleUpload = async (file) => {
    if (!entityId) {
      message.warning("Please save the form first before uploading documents");
      return false;
    }

    // Check max files limit
    if (uploads.length + fileList.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    try {
      setUploading(true);
      const response = await uploadService.uploadFile(
        file,
        entityType,
        entityId
      );

      if (response.success) {
        message.success("File uploaded successfully");
        await fetchUploads();
        setFileList([]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleDownload = async (upload) => {
    try {
      await uploadService.downloadFile(upload.id, entityType, upload.name);
      message.success("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file");
    }
  };

  const handleDelete = async (uploadId) => {
    try {
      const response = await uploadService.deleteUpload(uploadId, entityType);
      if (response.success) {
        message.success("File deleted successfully");
        await fetchUploads();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(error.message || "Failed to delete file");
    }
  };

  const uploadProps = {
    name: "file",
    multiple: true,
    fileList: fileList,
    beforeUpload: handleUpload,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    disabled: disabled || !entityId || uploading,
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Upload Section */}
      <Card title="Upload Documents" size="small" style={{ marginBottom: 16 }}>
        {!entityId ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Text type="secondary">
              Please save the form first before uploading documents
            </Text>
          </div>
        ) : (
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for single or bulk upload. Maximum {maxFiles} files
              allowed.
            </p>
            {uploading && <Spin />}
          </Dragger>
        )}
      </Card>

      {/* Existing Uploads List */}
      {entityId && (
        <Card title="Uploaded Documents" size="small">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Spin />
            </div>
          ) : uploads.length === 0 ? (
            <Empty
              description="No documents uploaded yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={uploads}
              renderItem={(upload) => (
                <List.Item
                  key={upload.id}
                  actions={[
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(upload)}
                    >
                      Download
                    </Button>,
                    !disabled && (
                      <Popconfirm
                        title="Are you sure you want to delete this file?"
                        onConfirm={() => handleDelete(upload.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<FileOutlined style={{ fontSize: 24 }} />}
                    title={upload.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Size: {formatFileSize(upload.size)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Uploaded: {formatDate(upload.createdAt)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;
