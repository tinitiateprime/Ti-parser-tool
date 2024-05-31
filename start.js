// results.js
document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('results');
  const folders = JSON.parse(localStorage.getItem('folders')) || [];

  if (folders.length > 0) {
    folders.forEach(folder => {
      const folderElement = document.createElement('div');
      folderElement.classList.add('p-4', 'border', 'border-gray-200', 'rounded', 'mb-2', 'bg-gray-50');
      folderElement.textContent = folder.Name;
      resultsContainer.appendChild(folderElement);
    });
  } else {
    resultsContainer.textContent = 'No folders found.';
  }
});

function goBack() {
  window.location.href = 'index.html';
}
