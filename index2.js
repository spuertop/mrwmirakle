//Descomprimir ZIPS
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const jszip = require('jszip');

ipcMain.on('selectDir', async(even, args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    even.reply('selectDir', result.filePaths[0])
});

ipcMain.on('zipPath', async(even, args)=>{
    let contadorDePdf = 0;
    fs.readdir(args, function(err, filenames){
        filenames.forEach(function(filename){
            if(filename.endsWith('.zip')){
                fs.readFile(args +"\\"+ filename, function(err, data){
                    jszip.loadAsync(data)
                        .then(function(zip){
                            zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
                                if(zipEntry.name.endsWith('pdf')){
                                    zipEntry.async("nodebuffer")
                                        .then(function(data){
                                            let nameFile = filename.substring(0, filename.lastIndexOf('.')) + '.pdf';
                                            fs.writeFileSync(args+'\\'+ nameFile, data);
                                            contadorDePdf++;
                                            even.reply('zipPath', "Zip nº " + contadorDePdf + '. Archivo ' + filename + ' extrae ' + nameFile);
                                        });
                                }
                            });
                            
                        });
                });
            }
        });
    });
})

