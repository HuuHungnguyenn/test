const idea = document.getElementById('idea');
const out  = document.getElementById('out');

document.getElementById('gen').onclick = () => {
  const v = (idea.value || '').trim();
  if (!v) { out.textContent = 'Nhập ý tưởng trước đã nha 🫶'; return; }
  out.textContent =
`Ý tưởng: ${v}
Gợi ý cấu trúc:
- Hero: tagline + CTA
- 3 điểm nổi bật (icons)
- Section demo / gallery
- CTA cuối: “Dùng thử miễn phí”`;
};
