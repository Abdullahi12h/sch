import axios from 'axios';

const testAuth = async () => {
    // Try with WRONG password
    try {
        console.log('Testing WRONG password...');
        await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin@gmail.com',
            password: 'wrong_password'
        });
    } catch (error) {
        console.log('WRONG password status:', error.response?.status);
        console.log('WRONG password message:', error.response?.data?.message);
    }

    // Try with CORRECT password (based on all_users_info.json)
    try {
        console.log('\nTesting CORRECT password...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin@gmail.com',
            password: '12345'
        });
        console.log('CORRECT password successful:', response.data);
    } catch (error) {
        console.log('CORRECT password status:', error.response?.status);
        console.log('CORRECT password message:', error.response?.data?.message);
        console.log('CORRECT password error:', error.response?.data?.error);
        console.log('CORRECT password stack:', error.response?.data?.stack);
    }
};

testAuth();
