window.refreshSongs = async function() {
  const list = document.getElementById('songs-list');
  const { data, error } = await window.sb.from('G_songs').select('*').order('id', { ascending: false });
  list.innerHTML = '';
  if (error) {
    const li = document.createElement('li');
    li.textContent = '오류: ' + error.message;
    list.appendChild(li);
    return;
  }
  // 연습횟수 계산: G_weekly_practice의 곡이름1..10에서 해당 곡 id가 등장한 횟수 합
  const allSongIds = (data||[]).map(r => r.id);
  let counts = new Map();
  if (allSongIds.length) {
    const { data: uses } = await window.sb
      .from('G_weekly_practice')
      .select('*');
    (uses||[]).forEach(row => {
      for (let i=1;i<=10;i++) {
        const sid = row['곡이름'+i];
        if (sid && allSongIds.includes(sid)) {
          counts.set(sid, (counts.get(sid)||0)+1);
        }
      }
    });
  }
  (data || []).forEach((row, idx) => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'row';
    const num = document.createElement('span');
    num.textContent = String(idx + 1) + '.';
    const title = document.createElement('input');
    title.className = 'inline';
    title.value = row.title || '';
    const artist = document.createElement('input');
    artist.className = 'inline';
    artist.placeholder = '아티스트(선택)';
    artist.value = row.artist || '';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.title = '연습 횟수(요약)';
    badge.textContent = `연습 ${counts.get(row.id)||0}회`;
    left.appendChild(num);
    left.appendChild(title);
    left.appendChild(artist);
    left.appendChild(badge);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = '수정';
    saveBtn.addEventListener('click', async () => {
      const payload = { title: title.value.trim() };
      if (artist.value.trim()) payload.artist = artist.value.trim(); else payload.artist = null;
      await window.sb.from('G_songs').update(payload).eq('id', row.id);
      window.refreshSongs();
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger';
    delBtn.textContent = '삭제';
    delBtn.addEventListener('click', async () => {
      const pwd = prompt('삭제 비밀번호를 입력하세요 (힌트: 거북코 생년월일)');
      if (pwd !== '730830') {
        alert('비밀번호가 올바르지 않습니다.');
        return;
      }
      if (!confirm('정말 삭제하시겠습니까?')) return;
      await window.sb.from('G_songs').delete().eq('id', row.id);
      window.refreshSongs();
    });
    actions.appendChild(saveBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    list.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-song');
  const title = document.getElementById('song-title');
  const artist = document.getElementById('song-artist');
  addBtn.addEventListener('click', async () => {
    if (!title.value.trim()) return;
    await window.sb.from('G_songs').insert({ title: title.value.trim(), artist: artist.value.trim() || null });
    title.value = '';
    artist.value = '';
    window.refreshSongs();
  });

  window.refreshSongs();
});


