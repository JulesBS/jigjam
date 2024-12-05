// Toggle the central logo image on click
document.getElementById('logo-image').addEventListener('click', function() {
  const logo = this;
  if (logo.src.includes('logo.png')) {
    logo.src = 'assets/logo2.png';
  } else {
    logo.src = 'assets/logo.png';
  }
});
