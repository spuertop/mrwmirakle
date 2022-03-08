//Descomprimir ZIPS
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const jszip = require('jszip');

ipcMain.on('selectDir', async (even, args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    even.reply('selectDir', result.filePaths[0])
});

ipcMain.on('zipPath', async (even, args) => {
    let contadorDePdf = 0;
    fs.readdir(args, function (err, filenames) {
        if (err) {
            even.reply('zipPath', "Error en la lectura de la carpeta.");
        } else {
            for (let i = 0; i < filenames.length; i++) {
                let filename = filenames[i];
                if (filename.endsWith('.zip')) {
                    fs.readFile(args + '\\' + filename, async (err, data) => {
                        if (err) {
                            even.reply('zipPath', filename + ' está corrupto.')
                        } else {
                            let zip = await jszip.loadAsync(data);
                            zip.forEach(async function(relativePath, zipEntry) {
                                if (zipEntry.name.endsWith('pdf')) {
                                    let buffer = await zipEntry.async('nodebuffer');
                                    let nameFile = filename.substring(0, filename.lastIndexOf('.')) + '.pdf';
                                    fs.writeFileSync(args + '\\' + nameFile, buffer);
                                    contadorDePdf++;
                                    even.reply('zipPath', "Zip nº " + contadorDePdf + '. Archivo ' + filename + ' extrae ' + nameFile);
                                }
                            })
                        }
                    })
                }
            };
        }
    })
})