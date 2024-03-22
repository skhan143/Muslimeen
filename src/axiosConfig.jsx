import axios, { AxiosInstance } from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:', // Replace with your API's base URL
});
export default instance;
