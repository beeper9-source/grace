function ymd(d){
  // Local date (avoids UTC 하루 밀림 문제)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

window.loadWeek = async function(){
  const container = document.getElementById('week-list');
  container.innerHTML = '';
  const today = ymd(new Date());

  // 다음 연습일 1건 조회 (오늘 이후, 가장 가까운 미래 날짜)
  const { data, error } = await window.sb
    .from('G_weekly_practice')
    .select('*')
    .gt('연습일', today)
    .order('연습일', { ascending: true })
    .limit(1);

  const section = document.createElement('div');
  section.className = 'card';

  if (error) {
    const p = document.createElement('p');
    p.textContent = '오류: ' + error.message;
    section.appendChild(p);
    container.appendChild(section);
    return;
  }

  if (!data || data.length === 0) {
    const h3 = document.createElement('h3');
    h3.textContent = '예정된 연습이 없습니다';
    section.appendChild(h3);
    container.appendChild(section);
    return;
  }

  const row = data[0];
  const h3 = document.createElement('h3');
  h3.textContent = `${row['연습일']} 예정 곡`;
  section.appendChild(h3);

  const ids = [1,2,3,4,5,6,7,8,9,10].map(i => row['곡이름'+i]).filter(v => v!=null);
  if (ids.length === 0){
    const p = document.createElement('p');
    p.textContent = '등록된 곡이 없습니다';
    section.appendChild(p);
    container.appendChild(section);
    return;
  }

  const { data: songs } = await window.sb
    .from('G_songs')
    .select('id,title,artist')
    .in('id', ids);

  const ul = document.createElement('ul');
  (songs||[]).forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.title}${s.artist ? ' - ' + s.artist : ''}`;
    ul.appendChild(li);
  });
  section.appendChild(ul);
  container.appendChild(section);
};

document.addEventListener('DOMContentLoaded', () => window.loadWeek());


