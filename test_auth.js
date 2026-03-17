import axios from 'axios';

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@school.com',
            password: 'password123'
        });
        console.log('Login successful:', response.data.email);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
};

testLogin();
