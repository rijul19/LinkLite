

const {
  createBuffer,
  getBufferSize,
  writeFileStream,
  readFileStream,
  copyFileStream,
  getReportPath
} = require("./fileUtils");

const runTest = async () => {
  try {
    const reportPath = getReportPath("sample-report.txt");
    const copyPath = getReportPath("sample-report-copy.txt");

    const reportText = "LinkLite File Utilities Test\nURL: https://example.com\n";

    const buffer = createBuffer(reportText);
    console.log("Buffer size:", getBufferSize(buffer), "bytes");

    await writeFileStream(reportPath, buffer);
    console.log("Report written successfully!");

    const content = await readFileStream(reportPath);
    console.log("Read report:\n", content);

    await copyFileStream(reportPath, copyPath);
    console.log("Report copied successfully!");
  } catch (error) {
    console.error("File utility test failed:", error.message);
  }
};

runTest();
