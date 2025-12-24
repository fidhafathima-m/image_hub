import axiosInstance from "./axiosInstance";
import { BASE_URL } from "../utils/constants";

export const imagesAPI = {
  getImages: async () => {
    const response = await axiosInstance.get("/images");
    return response.data;
  },

  uploadImage: async (formData) => {
    const response = await axiosInstance.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  bulkUploadImages: async (files, titles) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    titles.forEach((title) => {
      formData.append("titles", title);
    });

    const response = await axiosInstance.post("/images/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateImage: async (id, data) => {
    const formData = new FormData();

    if (data.title) {
      formData.append("title", data.title);
    }

    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await axiosInstance.put(`/images/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteImage: async (id) => {
    const response = await axiosInstance.delete(`/images/${id}`);
    return response.data;
  },

  rearrangeImages: async (imageOrder) => {
    const response = await axiosInstance.put("/images/rearrange/order", {
      imageOrder,
    });
    return response.data;
  },

  getImageUrl: (fileName) => {
    return `${BASE_URL}/uploads/${fileName}`;
  },
};
