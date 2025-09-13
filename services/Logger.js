const fs = require("fs");

function logger(req, res) {
  const startTime = Date.now();
  res.on("finish", () => {
    const result = res.statusCode >= 400 ? "ERROR" : "SUCCESS";
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const log = `${new Date()} - ${req.method} - ${res.statusCode} - ${
      req.url
    } - ${result} - time: ${responseTime}ms\n`;

    fs.appendFile("./logs/appinfo.txt", log, (err) => {
      if (err) {
        console.log("Error appending file:", err);
      } else {
        console.log("Data appended successfully!");
      }
    });
  });
}

module.exports = logger;
