
const fs = require("fs");
const path = require("path");

// Create a logs folder inside the backend directory
const logsDirectory = path.join(__dirname, "../../logs");

// Create the folder if it does not exist
if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

// Log file location
const logFile = path.join(logsDirectory, "app.log");

// Function to write logs
const writeLog = (level, message) => {
    const timestamp = new Date().toISOString();

    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage, "utf8");
};

const info = (message) => writeLog("INFO", message);

const error = (message) => writeLog("ERROR", message);

module.exports = { info, error };
