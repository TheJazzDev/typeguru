const handleTabKey = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    window.location.href = '/';
  }
};

// Listen for keydown events to trigger the 'Tab' key handling.
document.addEventListener('keydown', handleTabKey);