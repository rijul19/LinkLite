
const createBuffer = (text) => {
    return Buffer.from(text, "utf8");
};

const readBuffer = (buffer) => {
    return buffer.toString("utf8");
};

const getBufferSize = (buffer) => {
    return buffer.length;
};

module.exports = {
    createBuffer,
    readBuffer,
    getBufferSize
};
