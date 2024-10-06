const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data.txt');

// Helper function to read data from the file
function readData() {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify({}));
    }
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
}

// Helper function to write data to the file
function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Functions to interact with the file
function setEmail(userId, email) {
    const data = readData();
    data[`${userId}_email`] = email;
    writeData(data);
}

function getEmail(userId) {
    const data = readData();
    return data[`${userId}_email`];
}

function setDailyClaimed(userId) {
    const data = readData();
    data[`${userId}_daily_claimed`] = true;
    writeData(data);
}

function isDailyClaimed(userId) {
    const data = readData();
    return data[`${userId}_daily_claimed`] || false;
}

function setCoins(userId, coins) {
    const data = readData();
    data[`${userId}_coins`] = coins;
    writeData(data);
}

function getCoins(userId) {
    const data = readData();
    return data[`${userId}_coins`] || 0;
}

// Functions for weekly claims
function setWeeklyClaimed(userId) {
    const data = readData();
    data[`${userId}_weekly_claimed`] = true; // Use a different key for weekly
    writeData(data);
}

function isWeeklyClaimed(userId) {
    const data = readData();
    return data[`${userId}_weekly_claimed`] || false; // Use a different key for weekly
}

module.exports = {
    setEmail,
    getEmail,
    setDailyClaimed,
    isDailyClaimed,
    setCoins,
    getCoins,
    setWeeklyClaimed,
    isWeeklyClaimed,
};
