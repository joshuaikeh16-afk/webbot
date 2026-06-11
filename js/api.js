
const API = (() => {
  const { url, key, table } = CONFIG.supabase;
 
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
 
  async function query(params = '') {
    try {
      const res = await fetch(`${url}/rest/v1/${table}${params}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API Error]', err);
      return null;
    }
  }
 
  async function patch(id, body) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API Patch Error]', err);
      return null;
    }
  }
 
  // Update a user's nested JSONB data field
  // Merges `updates` into the existing data object
  async function updateUserData(id, currentData, updates) {
    const merged = { ...currentData, ...updates };
    return patch(id, { data: merged });
  }
 
  // ── Prime Points ──────────────────────────────────────────────
  async function grantPrimePoints(id, currentData, amount, label = 'ADMIN_GRANT') {
    const current = Number(currentData.primePoints || 0);
    const history = Array.isArray(currentData.ppHistory) ? currentData.ppHistory : [];
    history.push({ pts: amount, label, ts: Date.now() });
    return updateUserData(id, currentData, {
      primePoints: current + amount,
      ppHistory: history,
    });
  }
 
  async function deductPrimePoints(id, currentData, amount, label = 'ADMIN_DEDUCT') {
    const current = Number(currentData.primePoints || 0);
    const history = Array.isArray(currentData.ppHistory) ? currentData.ppHistory : [];
    const deducted = Math.max(0, current - amount);
    history.push({ pts: -amount, label, ts: Date.now() });
    return updateUserData(id, currentData, {
      primePoints: deducted,
      ppHistory: history,
    });
  }
 
  // ── Cashout Requests ──────────────────────────────────────────
  async function getCashouts() {
    try {
      const res = await fetch(`${url}/rest/v1/cashout_requests?select=*&order=created_at.desc`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  }
 
  async function createCashout(body) {
    try {
      const res = await fetch(`${url}/rest/v1/cashout_requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch { return false; }
  }
 
  async function updateCashout(id, body) {
    try {
      const res = await fetch(`${url}/rest/v1/cashout_requests?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch { return false; }
  }
 
  // ── Leaderboards ──────────────────────────────────────────────
  // Prime Points leaderboard — order by primePoints inside JSONB
  async function getPPLeaderboard(limit = 50) {
    return query(`?select=*&order=data->>primePoints.desc.nullslast&limit=${limit}`);
  }
 
  // ── Guilds ────────────────────────────────────────────────────
  async function getGuildMembers(guildName) {
    return query(`?data->>guild=ilike.${encodeURIComponent(guildName)}&select=*`);
  }
 
  return {
    getAllUsers:       () => query('?select=*&order=data->>primos.desc.nullslast'),
    getUserByPhone:   (phone) => query(`?data->>phoneNumber=eq.${encodeURIComponent(phone)}&select=*`),
    getUserById:      (id) => query(`?id=eq.${encodeURIComponent(id)}&select=*`),
    getLeaderboard:   (limit = 20) => query(`?select=*&order=data->>primos.desc.nullslast&limit=${limit}`),
    searchUsers:      (term) => query(`?data->>name=ilike.*${encodeURIComponent(term)}*&select=*`),
    updateUser:       patch,
    updateUserData,
    grantPrimePoints,
    deductPrimePoints,
    getPPLeaderboard,
    getGuildMembers,
    getCashouts,
    createCashout,
    updateCashout,
  };
})();
 