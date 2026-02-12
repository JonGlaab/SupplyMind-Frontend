import axios from "axios";

const API_BASE = "/api/core/suppliers";

export const generateConnectOnboarding = async (supplierId) => {
  const res = await axios.post(`${API_BASE}/${supplierId}/connect/onboard`);
  return res.data;
};

export const getConnectStatus = async (supplierId) => {
  const res = await axios.get(`${API_BASE}/${supplierId}/connect/status`);
  return res.data;
};

export const mockEnableConnect = async (supplierId) => {
  await axios.post(`${API_BASE}/${supplierId}/connect/mock-enable`);
};
