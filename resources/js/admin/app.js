
// Toggle sidebar (mobile)
if (window.__BOOTSTRAP__?.categories?.length) {
  ProductController.categories = window.__BOOTSTRAP__.categories;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-toggle="sidebar"]')) {
    document.querySelector('.admin-sidebar')?.classList.toggle('mobile-open');
  }
});

// Đóng modal khi click nền (nếu bạn có modal .admin-modal)
document.addEventListener('click', (e) => {
  const modal = e.target.closest('.admin-modal');
  if (modal && e.target === modal) modal.remove(); // ví dụ: đóng modal
});
function getCsrf() {
  const el = document.querySelector('meta[name="csrf-token"]');
  return el ? el.content : '';
}
