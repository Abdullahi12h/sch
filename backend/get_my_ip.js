import https from 'https';

https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('\n--- IP-gaaga saxda ah ee MongoDB u baahan tahay ---');
        console.log('IP Address:', data);
        console.log('--------------------------------------------------');
        console.log('\nFadlan guriga MongoDB Atlas u gal, ka dibna IP-ga kor ku qoran ku dar Network Access.');
    });
}).on('error', (err) => {
    console.error('Error fetching IP:', err.message);
});
