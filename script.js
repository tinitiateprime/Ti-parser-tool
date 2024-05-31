





// script.js
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
let filesArray = []
// Prevent default drag behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('hover'), false);
});

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('hover'), false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

// Handle click to open file dialog
dropArea.addEventListener('click', () => fileInput.click());

// Handle file input change
fileInput.addEventListener('change', () => {
  debugger
    if (fileInput.files.length > 0) {
      filesArray = [...fileInput.files];
       // uploadFile(fileInput.files[0],localStorage.foldername);
        displayFile(0)
    }
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    filesArray = [...dt.files];
    fileInput.files = files; // Assign files to the file input element
   // uploadFile(files[0],localStorage.foldername); // Automatically upload the file
    displayFile(0)
}

async function uploadFile(file,parentFolder) {
    const formData = new FormData();
    formData.append('file', file);
  debugger
    try {
        const response = await fetch('http://localhost:5400/upload', {
            method: 'POST',
            body: formData,parentFolder
        });
        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.log('File upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

const filePreview = document.getElementById('file-preview')

async function displayFile(index) {
//debugger
const file = filesArray[index]; 
const fileType = file.type;
const reader = new FileReader();

reader.onload = (e) => {
filePreview.innerHTML = ''; // Clear the preview container
if (fileType.includes('image')) {
let img = new Image();
img.src = e.target.result;
filePreview.appendChild(img);
} else if (fileType.includes('text')) {
filePreview.textContent = e.target.result;
} else if (fileType === 'application/pdf') {
let iframe = document.createElement('iframe');
iframe.src = e.target.result;
iframe.style.width = '100%';
iframe.style.height = '500px';
filePreview.appendChild(iframe);
} else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
displayExcel(e.target.result);
}
else {
filePreview.textContent = 'File type not supported for preview';
}
};

if (fileType.includes('image') || fileType === 'application/pdf') {
reader.readAsDataURL(file);
} else if (fileType.includes('text')) {
reader.readAsText(file);
} else {
filePreview.textContent = 'Unsupported file type';
}


}


const fileContentDiv = document.getElementById('file-content');

async function  getupload(file){
try {
const response = await fetch(`/upload-file?page=${file.name}&fun=${file.path}`);
if (response.ok) {
    const content = await response.text();
    fileContentDiv.textContent = content;
    await getables()
} else {
    fileContentDiv.textContent = 'Error loading file content.';
}
} catch (error) {
fileContentDiv.textContent = 'Error loading file content.';
}

if (fileType.includes('image') || fileType === 'application/pdf') {
reader.readAsDataURL(file);
} else if (fileType.includes('text')) {
reader.readAsText(file);
} else {
filePreview.textContent = 'Unsupported file type';
}

}

async function getables(){
debugger
const tableContainer = document.getElementById('tableContainer');
  const addRowButton = document.getElementById('addRow');
  const addColumnButton = document.getElementById('addColumn');

  // Replace 'YOUR_FILE_URL' with the actual URL to your HTML table file
  fetch(`/latest-file`)
      .then(response => response.text())
      .then(data => {
          tableContainer.innerHTML = data;
          makeTableEditable();
      })
      .catch(error => console.error('Error loading the table:', error));

  function makeTableEditable() {
      const table = document.querySelector('#tableContainer table');
      Array.from(table.querySelectorAll('td')).forEach(cell => {
          cell.contentEditable = true;
      });
  }

  addRowButton.addEventListener('click', () => {
      const table = document.querySelector('#tableContainer table');
      const newRow = table.insertRow(-1);
      for (let i = 0; i < table.rows[0].cells.length; i++) {
          const newCell = newRow.insertCell(i);
          newCell.contentEditable = true;
          newCell.innerText = "Click to edit";
      }
  });

  addColumnButton.addEventListener('click', () => {
      const table = document.querySelector('#tableContainer table');
      let headerRow = table.tHead.rows[0];
      let newHeader = headerRow.insertCell(-1);
      newHeader.innerText = "New Column";

      Array.from(table.tBodies[0].rows).forEach(row => {
          let newCell = row.insertCell(-1);
          newCell.contentEditable = true;
          newCell.innerText = "Click to edit";
      });
  });
}