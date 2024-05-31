// renderer.js
document.getElementById('usernameForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  debugger
  const username = document.getElementById('username').value;
 // const path = document.getElementById('path').value;

  // Fetch folders
  const folders = await window.electronAPI.fetchFolders(username);

  // Store the folders in localStorage to pass to the results page
  debugger
 
  const folderListQuery = encodeURIComponent(JSON.stringify(folders));


  // Navigate to the results page
  window.location.href = `folders.html?username=${username}&folders=${folderListQuery}`;
});
