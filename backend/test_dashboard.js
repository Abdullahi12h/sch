import axios from 'axios';

const test = async () => {
    try {
        // First login to get a token
        const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            username: 'admin', // assuming this exists
            password: 'password123' // assuming this exists
        });
        
        const token = loginRes.data.token;
        console.log('Login successful');

        // Call dashboard stats
        const statsRes = await axios.get('http://127.0.0.1:5000/api/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dashboard Stats:', statsRes.data);
    } catch (error) {
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

test();
