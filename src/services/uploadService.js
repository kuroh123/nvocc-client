import apiService from "./apiService";

/**
 * Upload a file for a specific entity
 * @param {File} file - The file to upload
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 * @param {string} entityId - ID of the entity
 */
const uploadFile = async (file, entityType, entityId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", entityType);
  formData.append("entityId", entityId);

  // Use custom fetch to avoid JSON.stringify in apiService
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const response = await fetch(
    `${API_BASE_URL}/api/${entityType}s/${entityId}/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
};

/**
 * Get all uploads for a specific entity
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 * @param {string} entityId - ID of the entity
 */
const getEntityUploads = async (entityType, entityId) => {
  const response = await apiService.get(
    `/api/${entityType}s/${entityId}/uploads`
  );
  return response;
};

/**
 * Get a single upload by ID
 * @param {string} uploadId - ID of the upload
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 */
const getUploadById = async (uploadId, entityType) => {
  const response = await apiService.get(
    `/api/${entityType}s/uploads/${uploadId}`
  );
  return response;
};

/**
 * Download a file
 * @param {string} uploadId - ID of the upload
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 * @param {string} fileName - Name of the file to download
 */
const downloadFile = async (uploadId, entityType, fileName) => {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const response = await fetch(
    `${API_BASE_URL}/api/${entityType}s/uploads/${uploadId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to download file");
  }

  // Get the blob from response
  const blob = await response.blob();

  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || "download");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return { success: true };
};

/**
 * Delete an upload
 * @param {string} uploadId - ID of the upload
 * @param {string} entityType - Type of entity (port, terminal, agent, depot)
 */
const deleteUpload = async (uploadId, entityType) => {
  const response = await apiService.delete(
    `/api/${entityType}s/uploads/${uploadId}`
  );
  return response;
};

const uploadService = {
  uploadFile,
  getEntityUploads,
  getUploadById,
  downloadFile,
  deleteUpload,
};

export default uploadService;
