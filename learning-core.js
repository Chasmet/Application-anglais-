/* Shared, versioned learning data. Existing qa3/adult keys are preserved. */
(() => {
  'use strict';
  const allowed = key => /^(qa3_|academy_|adult|learning_)/.test(key);
  function read(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
    catch (_) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { window.dispatchEvent(new CustomEvent('learning-storage-error')); return false; }
  }
  function day() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function profile() {
    const value = read('learning_profile', null) || localStorage.getItem('academy_profile') || 'Yvane';
    return ['Yvane', 'Nelvyn', 'Nelvin'].includes(value) ? value : 'Yvane';
  }
  function setProfile(value) {
    if (!['Yvane', 'Nelvyn', 'Nelvin'].includes(value)) return;
    write('learning_profile', value); localStorage.setItem('academy_profile', value);
  }
  function sessionKey(module) { return `learning_session_${module}_${module.startsWith('adult') || module === 'passive' ? 'adult' : profile()}`; }
  function saveSession(module, data) {
    write(sessionKey(module), { schema: 1, updatedAt: Date.now(), data });
    write('learning_last_session', { module, profile: profile(), updatedAt: Date.now() });
  }
  function getSession(module) { const s = read(sessionKey(module), null); return s && s.schema === 1 ? s.data : null; }
  function clearSession(module) {
    localStorage.removeItem(sessionKey(module));
    if (read('learning_last_session', {})?.module === module) localStorage.removeItem('learning_last_session');
  }
  function exportData() {
    const entries = {};
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (allowed(key)) entries[key] = localStorage.getItem(key); }
    return JSON.stringify({ app: 'AnglaisPlus', schema: 1, createdAt: new Date().toISOString(), entries }, null, 2);
  }
  function validateBackup(text) {
    if (typeof text !== 'string' || text.length > 4000000) throw new Error('Sauvegarde trop volumineuse.');
    const b = JSON.parse(text);
    if (b?.app !== 'AnglaisPlus' || b.schema !== 1 || !b.entries || Array.isArray(b.entries) || typeof b.entries !== 'object') throw new Error('Format de sauvegarde non reconnu.');
    for (const [key, value] of Object.entries(b.entries)) {
      if (!allowed(key) || typeof value !== 'string' || value.length > 1000000) throw new Error('Données de sauvegarde invalides.');
    }
    return b;
  }
  function importData(text) {
    const b = validateBackup(text), previous = {};
    Object.keys(b.entries).forEach(k => previous[k] = localStorage.getItem(k));
    try { for (const [key, value] of Object.entries(b.entries)) localStorage.setItem(key, value); }
    catch (e) {
      for (const [key, value] of Object.entries(previous)) { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); }
      throw new Error('Espace insuffisant. La restauration a été annulée.');
    }
    return Object.keys(b.entries).length;
  }
  function markActivity(id, points = 1) {
    const key = `learning_awards_${profile()}`, d = day(), old = read(key, { day: d, ids: [] });
    const log = old.day === d && Array.isArray(old.ids) ? old : { day: d, ids: [] };
    if (log.ids.includes(id)) return false;
    log.ids.push(id); log.ids = log.ids.slice(-1000); write(key, log);
    const dailyKey = `academy_daily_${profile()}`, oldDaily = read(dailyKey, {});
    const daily = oldDaily.day === d ? oldDaily : { day: d, count: 0 };
    daily.count = (Number(daily.count) || 0) + points; write(dailyKey, daily);
    return true;
  }
  window.LearningStore = { read, write, day, profile, setProfile, saveSession, getSession, clearSession, exportData, validateBackup, importData, markActivity };
  const size = read('learning_text_size', 'normal');
  document.documentElement.dataset.textSize = size === 'large' ? 'large' : 'normal';
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.back').forEach(a => a.setAttribute('aria-label', 'Retour'));
    const last = read('learning_last_session', null);
    const routes = { quiz: 'quiz.html', adultOral: 'adult-oral.html', adultTraining: 'adult-training.html', adultConversation: 'adult-conversation.html', passive: 'passive-oral.html' };
    const button = document.getElementById('resumeLearning');
    if (button && last && routes[last.module]) { button.hidden = false; button.href = routes[last.module] + '?resume=1'; }
  });
})();
