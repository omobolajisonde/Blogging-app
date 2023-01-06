const morgan = require("morgan");
const json = require("morgan-json");
const logger = require("./logger");

const format = json({
  method: ":method",
  url: ":url",
  status: ":status",
  contentLength: ":res[content-length]",
  responseTime: ":response-time ms",
});

module.exports = morgan(format, {
  stream: {
    write: (log) => {
      const { method, url, status, contentLength, responseTime } =
        JSON.parse(log);

      logger.info("HTTP Access Log", {
        timestamp: new Date().toString(),
        method,
        url,
        status: Number(status),
        contentLength,
        responseTime,
      });
    },
  },
});
