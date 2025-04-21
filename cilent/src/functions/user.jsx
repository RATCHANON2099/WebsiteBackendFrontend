// src/functions/user.js
import axiosInstance from "../api/axiosInstance";

export const remove = async (id) => await axiosInstance.delete("/user/" + id);

export const create = async (data) => await axiosInstance.post("/user/", data);

export const getdata = async () => {
  return await axiosInstance.get("/user/");
};

export const read = async (id) => {
  return await axiosInstance.get("/user/" + id);
};

export const update = async (id, data) => {
  return await axiosInstance.put("/user/" + id, data);
};

export const register = async (data) => {
  return await axiosInstance.post("/register/", data);
};
