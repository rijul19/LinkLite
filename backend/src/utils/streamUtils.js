
const fs = require("fs");
const path = require("path");

// Read a file using a readable stream
const readFileStream = (filePath) => {
    const readable = fs.createReadStream(filePath, {
        encoding: "utf8"
    });

    readable.on("data", (chunk) => {
        console.log("Received chunk:", chunk);
    });

    readable.on("end", () => {
        console.log("File reading completed!");
    });

    readable.on("error", (error) => {
        console.error("Reading error:", error.message);
    });
};

// Write data using a writable stream
const writeFileStream = (filePath, data) => {
    const writable = fs.createWriteStream(filePath);

    writable.write(data);
    writable.end();

    writable.on("finish", () => {
        console.log("File writing completed!");
    });

    writable.on("error", (error) => {
        console.error("Writing error:", error.message);
    });
};

// Copy a file using pipe()
const copyFileStream = (source, destination) => {
    const readable = fs.createReadStream(source);
    const writable = fs.createWriteStream(destination);

    readable.pipe(writable);

    writable.on("finish", () => {
        console.log("File copied successfully!");
    });

    readable.on("error", (error) => {
        console.error("Reading error:", error.message);
    });

    writable.on("error", (error) => {
        console.error("Writing error:", error.message);
    });
};

module.exports = {
    readFileStream,
    writeFileStream,
    copyFileStream
};
