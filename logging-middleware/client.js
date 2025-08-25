const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://20.244.56.144/evaluation-service";
const AUTH_PATH = process.env.AUTH_PATH || "/auth";
const LOGS_PATH = process.env.LOGS_PATH || "/logs";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000
});

module.exports = { api, AUTH_PATH, LOGS_PATH };
