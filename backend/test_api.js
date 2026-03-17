import axios from 'axios';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin', // assuming there is an admin user
            password: 'password123' // assuming this is the password
        });
        const token = loginRes.data.token;
        const res = await axios.get('http://localhost:5000/api/teachers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('RESPONSE DATA:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('ERROR:', e.response?.data || e.message);
    }
}
test();
