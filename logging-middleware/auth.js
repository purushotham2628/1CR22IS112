const { api, AUTH_PATH } = require("./client");

let cachedToken = null;
let expiryEpoch = 0;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < expiryEpoch - 5) { // 5s safety window
    return cachedToken;
  }

  const payload = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLLNO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  };

  const { data } = await api.post(AUTH_PATH, payload);
  cachedToken = data.access_token || data.accessToken;
  const exp = Number(data.expires_in);
  const nowEpoch = Math.floor(Date.now() / 1000);
  expiryEpoch = exp > nowEpoch ? exp : nowEpoch + (Number.isFinite(exp) ? exp : 900);
  return cachedToken;
}

module.exports = { getToken };
