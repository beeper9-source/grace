// Tabs
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tabs button');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
      document.getElementById(`tab-${name}`).classList.add('active');
      if (name === 'songs') window.refreshSongs && window.refreshSongs();
      if (name === 'daily') window.loadDaily && window.loadDaily();
      if (name === 'week') window.loadWeek && window.loadWeek();
      if (name === 'weekly') window.loadWeeklyList && window.loadWeeklyList();
    });
  });
});

// Supabase init (use values from config/supabase.js)
const SUPABASE_URL = window.SUPABASE_CONFIG?.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey;
window.sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : (window.sb || null);


