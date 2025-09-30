function ymd(d){ return d.toISOString().slice(0,10); }
function formatMD(yyyyMmDd){
  // expect 'YYYY-MM-DD' → 'MM/DD'
  if (!yyyyMmDd || typeof yyyyMmDd !== 'string' || yyyyMmDd.length < 10) return yyyyMmDd || '';
  const mm = yyyyMmDd.slice(5,7);
  const dd = yyyyMmDd.slice(8,10);
  return `${mm}/${dd}`;
}

window.loadWeeklyList = async function(){
  const container = document.getElementById('weekly-list');
  container.innerHTML = '';

  const { data, error } = await window.sb
    .from('G_weekly_practice')
    .select('*')
    .order('연습일', { ascending: true });

  if (error){
    const p = document.createElement('p');
    p.textContent = '오류: ' + error.message;
    container.appendChild(p);
    return;
  }

  const rows = data || [];

  // 테이블 생성
  const table = document.createElement('table');
  table.className = 'summary-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>날짜</th><th>연습곡1</th><th>연습곡2</th><th>연습곡3</th><th>연습곡4</th><th>연습곡5</th><th>연습곡6</th><th>연습곡7</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  for (const row of rows){
    const ids = [1,2,3,4,5,6,7].map(i => row['곡이름'+i]).filter(v => v!=null);
    let titles = ['','','','','','',''];
    if (ids.length){
      const { data: songs } = await window.sb
        .from('G_songs')
        .select('id,title')
        .in('id', ids);
      const map = new Map((songs||[]).map(s => [s.id, s.title]));
      titles = [1,2,3,4,5,6,7].map(i => {
        const val = row['곡이름'+i];
        return val ? (map.get(val) || '') : '';
      });
    }

    const tr = document.createElement('tr');
    // month class for coloring
    const monthClass = 'month-' + String(row['연습일']).slice(5,7);
    tr.className = monthClass;
    const tds = [formatMD(row['연습일']), ...titles];
    tds.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('button[data-tab="weekly"]')) {
    // 탭 진입 시 로드되도록 app.js에도 훅 연결되어 있음
  }
});


