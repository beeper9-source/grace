function ymd(d){ return d.toISOString().slice(0,10); }

async function loadPicker(selectedIds){
  const wrap = document.getElementById('song-picker');
  const { data } = await window.sb.from('G_songs').select('id,title,artist').order('title');
  wrap.innerHTML = '';
  (data||[]).forEach(row => {
    const div = document.createElement('div');
    div.className = 'item' + (selectedIds.includes(row.id)? ' selected' : '');
    const span = document.createElement('span');
    span.textContent = row.title + (row.artist ? ' - ' + row.artist : '');
    const btn = document.createElement('button');
    btn.textContent = selectedIds.includes(row.id) ? '제외' : '선택';
    btn.addEventListener('click', () => {
      const idx = selectedIds.indexOf(row.id);
      if (idx >= 0){ selectedIds.splice(idx,1); }
      else if (selectedIds.length < 10){ selectedIds.push(row.id); }
      loadPicker(selectedIds);
    });
    div.appendChild(span); div.appendChild(btn);
    wrap.appendChild(div);
  });
}

window.loadDaily = async function(){
  const dateInput = document.getElementById('practice-date');
  if (!dateInput.value) dateInput.value = ymd(new Date());
  const { data } = await window.sb
    .from('G_weekly_practice')
    .select('*')
    .eq('연습일', dateInput.value)
    .order('id')
    .limit(1);
  let selected = [];
  if (data && data.length){
    const row = data[0];
    selected = [1,2,3,4,5,6,7,8,9,10].map(i => row['곡이름'+i]).filter(v => v!=null);
  }
  loadPicker(selected);
};

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-daily');
  const dateInput = document.getElementById('practice-date');
  let currentSelected = [];
  // Re-render picker when date changes
  dateInput.addEventListener('change', () => window.loadDaily());

  // Intercept loadPicker to capture current selection
  const orig = loadPicker;
  loadPicker = function(sel){ currentSelected = sel.slice(); return orig(sel); };

  saveBtn.addEventListener('click', async () => {
    const payload = { '연습일': dateInput.value };
    for (let i=1;i<=10;i++) payload['곡이름'+i] = currentSelected[i-1] ?? null;
    // 기존 데이터 존재 여부 확인
    const { data: exists, error: findErr } = await window.sb
      .from('G_weekly_practice')
      .select('id')
      .eq('연습일', dateInput.value)
      .order('id', { ascending: true })
      .limit(1);
    if (findErr) { alert('조회 오류: ' + findErr.message); return; }
    if (exists && exists.length) {
      const targetId = exists[0].id;
      const { error: updErr } = await window.sb
        .from('G_weekly_practice')
        .update(payload)
        .eq('id', targetId);
      if (updErr) alert('업데이트 실패: ' + updErr.message); else alert('업데이트되었습니다');
    } else {
      const { error: insErr } = await window.sb
        .from('G_weekly_practice')
        .insert(payload);
      if (insErr) alert('저장 실패: ' + insErr.message); else alert('저장되었습니다');
    }
  });

  window.loadDaily();
});


