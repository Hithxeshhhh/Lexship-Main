import axios from "axios";

const instance = axios.create({
  headers: {
    Authorization: `Bearer ${import.meta.env.REACT_APP_BEARER_TOKEN}`,
  },
});

export default instance;
