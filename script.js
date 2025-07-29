
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("side-menu");
  const overlay = document.getElementById("overlay");

  if (toggle && menu && overlay) {
    toggle.addEventListener("click", () => {
      menu.classList.add("open");
      overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
      menu.classList.remove("open");
      overlay.classList.remove("active");
    });
  }
});
