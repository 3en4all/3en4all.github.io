console.log("menu.js uruchomiony");

const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");
const menuOverlay = document.getElementById("menu-overlay");
const closeMenu = document.getElementById("close-menu");

if (menuToggle && sideMenu && menuOverlay) {
  console.log("Elementy menu znalezione");

  menuToggle.addEventListener("click", function () {
    console.log("Kliknięto hamburgera");
    sideMenu.classList.add("open");
    menuOverlay.classList.add("active");
    menuToggle.classList.add("active");
    document.body.classList.add("menu-open");
  });

  const closeSideMenu = () => {
    console.log("Zamykam menu");
    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("active");
    menuToggle.classList.remove("active");
    document.body.classList.remove("menu-open");
  };

  if (closeMenu) {
    closeMenu.addEventListener("click", closeSideMenu);
  }

  menuOverlay.addEventListener("click", closeSideMenu);

  // Zamyka menu gdy klikniesz cokolwiek poza <a> lub #menu-toggle
  document.addEventListener("click", function (event) {
    const path = event.composedPath();
    const clickedLinkOrToggle = path.some(el =>
      el.tagName === "A" || el === menuToggle
    );
    if (!clickedLinkOrToggle && sideMenu.classList.contains("open")) {
      closeSideMenu();
    }
  });
} else {
  console.log("Nie znaleziono elementów menu");
}