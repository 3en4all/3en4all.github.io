
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
    console.log("Dodano klasę .open do #side-menu");
    console.log("Klasy side-menu:", sideMenu.classList.value);
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
} else {
  console.log("Nie znaleziono elementów menu");
}
