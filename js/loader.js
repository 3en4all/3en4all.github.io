
window.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then(res => res.text())
    .then(html => document.getElementById("header").innerHTML = html);

  fetch("footer.html")
    .then(res => res.text())
    .then(html => document.getElementById("footer").innerHTML = html);
});
