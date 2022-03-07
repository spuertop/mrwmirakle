const { ipcRenderer } = require('electron');

//Buscar pedidos ECI
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

});

//Descomprimir ZIPS
const btnProcesar = document.getElementById('procesa');
const resultZips = document.getElementById('p2');
const inputZip = document.getElementById('loszip');

inputZip.addEventListener('click', (e)=>{
    e.preventDefault();
    ipcRenderer.send('selectDir');
});
ipcRenderer.on('selectDir', (e, data)=>{
    inputZip.value = data;
});

btnProcesar.addEventListener('click', (e)=>{
    e.preventDefault();
    if(inputZip.value != ''){
        ipcRenderer.send('zipPath', inputZip.value)
    }
})

ipcRenderer.on('zipPath', (e, data)=>{
    resultZips.insertAdjacentHTML('afterbegin', '<li>' + data + '</li>');
})