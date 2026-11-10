const features = ['Analytics', 'API access', 'Priority support', 'Team seats', 'Custom reports'];
const tiers = ['Free', 'Pro', 'Enterprise'];

function values(ids) { return Object.fromEntries(ids.map(id => [id, document.getElementById(id).value])); }
async function api(url, options = {}) { const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options }); return response.json(); }

document.getElementById('tier-builder').innerHTML = tiers.map(tier => `<div class="tier"><h3>${tier}</h3><input class="tier-price" data-tier="${tier}" placeholder="Price"><div>${features.map(feature => `<label><input type="checkbox" data-tier="${tier}" value="${feature}"> ${feature}</label>`).join('')}</div></div>`).join('');

document.getElementById('login-form').onsubmit = async event => {
  event.preventDefault();
  const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: document.getElementById('login-user').value, password: document.getElementById('login-pass').value }) });
  document.getElementById('account-message').textContent = result.message || result.error;
};

document.getElementById('register-form').onsubmit = async event => {
  event.preventDefault();
  const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: document.getElementById('register-user').value, password: document.getElementById('register-pass').value, role: document.getElementById('register-role')?.value }) });
  document.getElementById('account-message').textContent = result.username ? `Registered ${result.username}` : result.error;
};

document.getElementById('elasticity-form').onsubmit = async event => {
  event.preventDefault();
  const result = await api('/api/elasticity/simulate', { method: 'POST', body: JSON.stringify(values(['oldPrice', 'oldVolume', 'elasticity', 'newPrice'])) });
  document.getElementById('elasticity-result').textContent = JSON.stringify(result, null, 2);
  await saveScenario('Elasticity scenario', 'elasticity', values(['oldPrice', 'oldVolume', 'elasticity', 'newPrice']), result);
};

document.getElementById('discount-form').onsubmit = async event => {
  event.preventDefault();
  const result = await api('/api/discounts/calculate', { method: 'POST', body: JSON.stringify(values(['discount-price', 'discount-cost', 'discount-percent', 'volume-lift'])) });
  document.getElementById('discount-result').textContent = JSON.stringify(result, null, 2);
  await saveScenario('Discount scenario', 'discount', values(['discount-price', 'discount-cost', 'discount-percent', 'volume-lift']), result);
};

async function saveScenario(name, type, inputs, result) { await api('/api/scenarios', { method: 'POST', body: JSON.stringify({ name, type, inputs, result }) }); }

document.getElementById('save-tier').onclick = async () => {
  const config = tiers.map(tier => ({ name: tier, price: document.querySelector(`.tier-price[data-tier="${tier}"]`).value, features: [...document.querySelectorAll(`input[type="checkbox"][data-tier="${tier}"]:checked`)].map(input => input.value) }));
  const result = await api('/api/tiers', { method: 'POST', body: JSON.stringify({ name: document.getElementById('tier-name').value, tiers: config }) });
  document.getElementById('tier-message').textContent = result.id ? 'Tier configuration saved' : result.error;
};

document.getElementById('load-scenarios').onclick = async () => {
  const rows = await api(`/api/scenarios?search=${encodeURIComponent(document.getElementById('scenario-search').value)}`);
  document.getElementById('scenario-list').innerHTML = rows.map(row => `<article><h3>${row.name}</h3><p>${row.type}</p><pre>${JSON.stringify(row.result, null, 2)}</pre></article>`).join('');
};
