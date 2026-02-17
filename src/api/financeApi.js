import axios from "axios";

export const getReadyPos = async () => {
  const res = await axios.get("/api/core/finance/po/ready");
  return res.data;
};

export const createInvoiceFromPo = async (poId) => {
  const res = await axios.post(`/api/core/finance/invoices/from-po/${poId}`);
  return res.data;
};

export const getInvoiceByPo = async (poId) => {
  const res = await axios.get(`/api/core/finance/invoices/by-po/${poId}`);
  return res.data; // can be null
};

export const approveInvoice = async (invoiceId) => {
  await axios.post(`/api/core/finance/invoices/${invoiceId}/approve`);
};

// ✅ returns Long supplierPaymentId
export const schedulePayment = async (payload) => {
  const res = await axios.post("/api/core/finance/payments/schedule", payload);
  return res.data; // number
};

export const executePayment = async (supplierPaymentId) => {
  const res = await axios.post(
    `/api/core/finance/payments/${supplierPaymentId}/execute`
  );

  // res.data = ExecutePaymentResponseDTO
  return res.data;
};


export const getPaymentsByInvoice = async (invoiceId) => {
  const res = await axios.get(`/api/core/finance/invoices/${invoiceId}/payments`);
  return res.data; // list
};

export const getSupplierPaymentTimeline = async (supplierId) => {
  const res = await axios.get(`/api/core/finance/suppliers/${supplierId}/payments/timeline`);
  return res.data; // list of timeline items
};



