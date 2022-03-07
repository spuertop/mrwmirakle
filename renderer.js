const { ipcRenderer } = require('electron');
const clica = document.getElementById('clica');
const p = document.getElementById('p');
const file = document.getElementById('sendFile');

file.addEventListener('click', (e) => {
    e.preventDefault();
    p.innerHTML = '';
    let file = document.getElementById('file').files[0].path;
    ipcRenderer.send('loadFile', file);
});

ipcRenderer.on('loadFile', (e, data) => {
    if (data.startsWith('Resultado')) {
        p.insertAdjacentHTML('afterbegin', '<li style="background-color: green; color: white">' + data + '</li>');
    } else {
        p.insertAdjacentHTML('afterbegin', '<small><li>' + data + '</li><small>');
    }

})