import axios from 'axios';

const API = axios.create({
    // This is the "Key" to your backend server
    baseURL: 'http://localhost:5000/api', 
});

export default API;