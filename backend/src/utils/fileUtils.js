
const fs = require("fs");
const path = require("path");

// 1. Create a Buffer from text
const createBuffer = (text) => {
  return Buffer.from(text, "utf8");
};

// 2. Get Buffer size in bytes
const getBufferSize = (buffer) => {
  return buffer.length;
};

// 3. Write data to a file using a Writable Stream
const writeFileStream = (filePath, data) => {
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(filePath);

    writable.on("finish", resolve);
    writable.on("error", reject);

    writable.end(data);
  });
};

// 4. Read a file using a Readable Stream
const readFileStream = (filePath) => {
  return new Promise((resolve, reject) => {
    let content = "";
    const readable = fs.createReadStream(filePath, {
      encoding: "utf8"
    });

    readable.on("data", (chunk) => {
      content += chunk;
    });

    readable.on("end", () => resolve(content));
    readable.on("error", reject);
  });
};

// 5. Copy a file using streams and pipe()
const copyFileStream = (source, destination) => {
  return new Promise((resolve, reject) => {
    const readable = fs.createReadStream(source);
    const writable = fs.createWriteStream(destination);

    readable.pipe(writable);

    readable.on("error", reject);
    writable.on("error", reject);
    writable.on("finish", resolve);
  });
};

// 6. Create a safe file path
const getReportPath = (fileName) => {
  return path.join(__dirname, "../../reports", fileName);
};

module.exports = {
  createBuffer,
  getBufferSize,
  writeFileStream,
  readFileStream,
  copyFileStream,
  getReportPath
};

