
 
  document.getElementById('usernameForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    //debugger
    const username = document.getElementById('username').value;
    window.location.href = `./folders.html`
    try {
      const response = await fetch('/api/folders-filename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
  
      const result = await response.json();
      
      if (response.ok) {
        debugger
        const folderListQuery = encodeURIComponent(JSON.stringify(result.folders));
        window.location.href = `/folders.html?username=${username}&folders=${folderListQuery}`;
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  