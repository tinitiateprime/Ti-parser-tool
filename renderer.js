document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('login-form')) {
    const roleSelect = document.getElementById('role');
    const passwordLabel = document.getElementById('password-label');
    const passwordInput = document.getElementById('password');

    roleSelect.addEventListener('change', function() {
      if (roleSelect.value === 'admin') {
        passwordLabel.classList.remove('hidden');
        passwordInput.classList.remove('hidden');
        passwordInput.required = true;
      } else {
        passwordLabel.classList.add('hidden');
        passwordInput.classList.add('hidden');
        passwordInput.required = false;
      }
    });

    document.getElementById('login-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const role = document.getElementById('role').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (role === 'admin') {
        const isAdmin = await window.electronAPI.checkAdmin({ username, password });

        if (isAdmin) {
          window.location.href = 'admin.html';
        } else {
          showError();
        }
      } else if (role === 'user') {
        const users = await window.electronAPI.getUsers();
        const isUser = users.some(user => user.username === username && user.status !== 'Archived');

        if (isUser) {
          window.location.href = 'user.html';
        } else {
          showError();
        }
      }
    });
  }

  if (document.getElementById('user-table')) {
    await loadUsers();

    // Add user button
    document.getElementById('add-user').addEventListener('click', function() {
      openModal('user-modal');
    });

    // Modal form submission
    document.getElementById('user-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const newUsername = document.getElementById('new-username').value;
      if (newUsername) {
        const users = await window.electronAPI.getUsers();
        users.push({ username: newUsername, status: 'Active' });
        await window.electronAPI.saveUsers(users);
        await loadUsers();
        closeModal('user-modal');
      }
    });

    // Modal close button
    document.querySelector('.close-button').addEventListener('click', () => closeModal('user-modal'));

    // Archived users button
    document.getElementById('archived-users').addEventListener('click', async function() {
      await loadArchivedUsers();
      openModal('archived-modal');
    });

    // Archived modal close button
    document.querySelector('.close-archived-button').addEventListener('click', () => closeModal('archived-modal'));

    // Rename modal close button
    document.querySelector('.close-rename-button').addEventListener('click', () => closeModal('rename-modal'));

    // Rename form submission
    document.getElementById('rename-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const oldUsername = document.getElementById('rename-form').dataset.oldUsername;
      const newUsername = document.getElementById('rename-username').value;
      if (newUsername) {
        const users = await window.electronAPI.getUsers();
        const user = users.find(u => u.username === oldUsername);
        if (user) {
          user.username = newUsername;
          await window.electronAPI.saveUsers(users);
          await loadUsers();
          closeModal('rename-modal');
        }
      }
    });

    // Logout button
    document.getElementById('logout').addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
});

async function loadUsers() {
  const users = await window.electronAPI.getUsers();
  populateUserTable(users.filter(user => user.status !== 'Archived'));
}

async function loadArchivedUsers() {
  const users = await window.electronAPI.getUsers();
  populateArchivedTable(users.filter(user => user.status === 'Archived'));
}

function populateUserTable(users) {
  const tableBody = document.getElementById('user-table').querySelector('tbody');
  tableBody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${user.username}</td>
      <td class="border px-4 py-2">${user.status}</td>
      <td class="border px-4 py-2">
        <button onclick="openRenameModal('${user.username}')" class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-700">Rename</button>
        <button onclick="activateUser('${user.username}')" class="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-700">Activate</button>
        <button onclick="archiveUser('${user.username}')" class="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-700">Archive</button>
        <button onclick="disableUser('${user.username}')" class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-700">Disable</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function populateArchivedTable(users) {
  const tableBody = document.getElementById('archived-table').querySelector('tbody');
  tableBody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border px-4 py-2">${user.username}</td>
      <td class="border px-4 py-2">
        <button onclick="unarchiveUser('${user.username}')" class="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-700">Unarchive</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.openRenameModal = function(username) {
  document.getElementById('rename-form').dataset.oldUsername = username;
  openModal('rename-modal');
}

window.activateUser = async function(username) {
  const users = await window.electronAPI.getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.status = 'Active';
    await window.electronAPI.saveUsers(users);
    await loadUsers();
  }
}

window.archiveUser = async function(username) {
  const users = await window.electronAPI.getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.status = 'Archived';
    await window.electronAPI.saveUsers(users);
    await loadUsers();
  }
}

window.disableUser = async function(username) {
  const users = await window.electronAPI.getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.status = 'Disabled';
    await window.electronAPI.saveUsers(users);
    await loadUsers();
  }
}

window.unarchiveUser = async function(username) {
  const users = await window.electronAPI.getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.status = 'Active';
    await window.electronAPI.saveUsers(users);
    await loadArchivedUsers();
  }
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  if (modalId === 'user-modal') {
    document.getElementById('user-form').reset();
  }
  if (modalId === 'rename-modal') {
    document.getElementById('rename-form').reset();
  }
}

function showError() {
  const errorMessage = document.getElementById('error-message');
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 3000);
}
