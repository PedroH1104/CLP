import axios from "axios";

export const api = axios.create({
  baseURL: "http://<seu_EndereçoIPv4_aqui>:8000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});