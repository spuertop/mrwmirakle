const XLSX = require('xlsx');
const dbconf = require('./dbconf');
const sql = require('mssql');
const { ipcMain } = require('electron');

ipcMain.on('loadFile', async(even, args) => {
    //let libro = XLSX.readFile('./Pedidos Atrasados Alcala 14.02 15h.xlsx');
    let libro = XLSX.readFile(args);
    let hoja1 = libro.Sheets[libro.SheetNames[0]];
    even.reply('loadFile', 'Leyendo archivo...')

    var range = XLSX.utils.decode_range(hoja1['!ref']);
    var ncols = range.e.c - range.s.c + 1,
        nrows = range.e.r - range.s.r + 1;

    async function bla() {
        XLSX.utils.sheet_add_aoa(hoja1, [
            ['N.Pedido']
        ], { origin: { r: 0, c: 15 } })
        XLSX.utils.sheet_add_aoa(hoja1, [
            ['Estado Doc.']
        ], { origin: { r: 0, c: 16 } })
        XLSX.utils.sheet_add_aoa(hoja1, [
            ['Estado Prep.']
        ], { origin: { r: 0, c: 17 } });
        XLSX.utils.sheet_add_aoa(hoja1, [
            ['Notas Estado']
        ], { origin: { r: 0, c: 18 } })
        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
            const colB = hoja1[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];
            //console.log(colB.v);
            //libro[{ r: rowNum, c: 21 }].v = 'Resultado SQL' //Si hay algo
            //Search in SQL value of colB.v
            let query = getQuery(colB.v);
            try {
                await sql.connect(dbconf);
                const result = (await sql.query(query)).recordset;
                if (result.length > 0) {
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        [result[0]['N.Pedido']]
                    ], { origin: { r: rowNum, c: 15 } });
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        [result[0]['Preparacion']]
                    ], { origin: { r: rowNum, c: 16 } });
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        [result[0]['Entrega']]
                    ], { origin: { r: rowNum, c: 17 } });
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        [result[0]['Estilo']]
                    ], { origin: { r: rowNum, c: 18 } })
                    even.reply('loadFile', 'Pedido ' + colB.v + ' - Preparacion: ' + result[0]['Preparacion'] + ', Expedicion: ' + result[0]['Entrega'])
                } else {
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        ['No recibido']
                    ], { origin: { r: rowNum, c: 16 } })
                    XLSX.utils.sheet_add_aoa(hoja1, [
                        ['No recibido']
                    ], { origin: { r: rowNum, c: 17 } })
                    even.reply('loadFile', 'Pedido ' + colB.v + '- No recibido')
                }
            } catch (error) {
                even.reply('loadFile', 'Error ' + error)
            }
        }
        let name = args.substring(0, args.lastIndexOf('.'));
        let extension = args.substring(args.lastIndexOf('.'));
        XLSX.writeFile(libro, name + ' (cruzado)' + extension);
        even.reply('loadFile', 'Resultado guardado en: ' + name + ' (cruzado)' + extension);
    };
    bla();
})

function getQuery(value) {
    return `select
    NumeroDePedidoDeTercero as 'N.Pedido', 
    case 
    when EstadoDePreparacion = 10 then 'Documentado'
    when EstadoDePreparacion = 5 then 'Parcialmente documentado'
    else 'Pendiente' end as Preparacion, 
    case
    when EstadoDeEntrega = 10 then 'Expedido'
    when EstadoDeEntrega = 5 then 'Parcialmente expedido'
    else 'Pendiente' end as Entrega,
    e.Descripcion as Estilo
    from PedidosDeClientes
    left join Estilos as e
    on Estilo = e.Indice
    where NroDE = '${value}'`
}