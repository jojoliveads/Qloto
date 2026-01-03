const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/admin/admin/registerAdmin';
const SECRET_KEY = 'X9fA7pQm2LrT8wZsB4cD1vH6jK0nE3yR'; // From .env

// Path to the service account key
const privateKeyPath = path.join(__dirname, '../admin/jojo-live-fbc27-firebase-adminsdk-2kaqk-995a811083.json');

async function createAdmin() {
    try {
        console.log("Reading private key from:", privateKeyPath);
        const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf8');

        const payload = {
            email: 'admin@gmail.com',
            password: '123',
            uid: 'admin-uid-123', // Optional, backend might generate or use this
            code: 'PURCHASE_CODE_PLACEHOLDER', // Backend requires this
            privateKey: privateKeyContent
        };

        console.log("Sending request to:", API_URL);
        const response = await axios.post(API_URL, payload, {
            headers: {
                'key': SECRET_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error creating admin:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

createAdmin();
