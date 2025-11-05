import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// AUTH
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) await axios.post(`${API_URL}/auth/logout`, { email: user.email });
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// RATES CRUD
export const getRates = async () => {
  const res = await axios.get(`${API_URL}/rates`, getAuthHeader());
  return res.data;
};

export const createRate = async (data) => {
  const res = await axios.post(`${API_URL}/rates`, data, getAuthHeader());
  return res.data;
};

export const updateRate = async (id, data) => {
  const res = await axios.put(`${API_URL}/rates/${id}`, data, getAuthHeader());
  return res.data;
};

export const deleteRate = async (id) => {
  const res = await axios.delete(`${API_URL}/rates/${id}`, getAuthHeader());
  return res.data;
};

// ADMIN
export const getAllUsers = async () => {
  const res = await axios.get(`${API_URL}/admin/users`, getAuthHeader());
  return res.data;
};
