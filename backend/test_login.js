import axios from 'axios';

const login = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin@gmail.com',
            password: '12345'
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.error('Login failed with status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        console.error('Full response error:', error.response?.data?.error);
    }
};

login();
