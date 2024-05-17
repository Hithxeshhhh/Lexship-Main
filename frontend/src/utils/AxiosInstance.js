import axios from "axios";

const instance = axios.create({
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
  },
});

export default instance;
