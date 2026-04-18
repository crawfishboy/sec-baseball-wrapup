async function loadPartial(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadPartial("header", "partials/header.html");
loadPartial("footer", "partials/footer.html");
