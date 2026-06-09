import axios from "axios";

const API = axios.create({
  baseURL: "https://personal-finance-app-mern.onrender.com"
});

export default API;