<<<<<<< HEAD

=======
>>>>>>> 0db9e0f4f757a9ec210af7bd18cf827be3a00be5
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
<<<<<<< HEAD

    document.querySelectorAll(".blur-wrapper").forEach(el => {
      const id = el.id;
      if (id !== "menu-toggle" && id !== "menu-overlay" && id !== "side-menu") {
        el.classList.add("blur");
      }
    });
=======
    document.querySelector("main, section.post-content")?.classList.add("blur");
>>>>>>> 0db9e0f4f757a9ec210af7bd18cf827be3a00be5
  });

  const closeSideMenu = () => {
    console.log("Zamykam menu");
    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("active");
    menuToggle.classList.remove("active");
    document.body.classList.remove("menu-open");
<<<<<<< HEAD

    document.querySelectorAll(".blur").forEach(el => {
      el.classList.remove("blur");
    });
=======
    document.querySelector("main, section.post-content")?.classList.remove("blur");
>>>>>>> 0db9e0f4f757a9ec210af7bd18cf827be3a00be5
  };

  if (closeMenu) {
    closeMenu.addEventListener("click", closeSideMenu);
  }

  menuOverlay.addEventListener("click", closeSideMenu);

<<<<<<< HEAD
=======
  // Zamyka menu gdy klikniesz cokolwiek poza <a> lub #menu-toggle
>>>>>>> 0db9e0f4f757a9ec210af7bd18cf827be3a00be5
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 0db9e0f4f757a9ec210af7bd18cf827be3a00be5
