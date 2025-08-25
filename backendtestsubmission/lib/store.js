
const map = new Map();

function saveMapping(code, url) {
  map.set(code, { url, createdAt: new Date().toISOString() });
}

function getMapping(code) {
  return map.get(code) || null;
}

module.exports = { saveMapping, getMapping };
