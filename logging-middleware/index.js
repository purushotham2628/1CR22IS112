const { api, LOGS_PATH } = require("./client");
const { getToken } = require("./auth");

/**
 * Log to evaluation server.
 * @param {"backend"|"frontend"} stack
 * @param {"debug"|"info"|"warn"|"error"|"fatal"} level
 * @param {"cache"|"controller"|"cron_job"|"db"|"domain"|"handler"|"repository"|"route"|"service"|"api"} pkg
 * @param {string} message
 */
async function log(stack, level, pkg, message) {
  try {
    const token = await getToken();
    await api.post(
      LOGS_PATH,
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    // Intentionally silent (do not throw) to avoid breaking caller flows.
    // No console noise per typical assessment guidelines.
  }
}

/**
 * Express middleware that logs request lifecycle.
 * Uses allowed enums: stack="backend", package="route"
 */
function loggingMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  log("backend", "info", "route", `REQ ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log("backend", level, "route", `RES ${req.method} ${req.originalUrl} ${res.statusCode} in ${ms.toFixed(2)}ms`);
  });

  next();
}

module.exports = { log, loggingMiddleware };
