const net = require('net');
const fs = require('fs');
const path = require('path');

const port = 8124;
const client = new net.Socket();
let files = [];
let promise;

client.setEncoding('utf8');

client.connect(port, function () {
    client.write('FILES');
});


client.on('data', function (data) {
    console.log('server: ' + data);
    switch (data) {
        case "DEC":
            client.destroy();
            break;
        case "ACK":
            if (!process.argv.length > 1) {
                console.log('Empty directories pathes');
            }
            else {
                for (let i = 2; i < process.argv.length; i++)
                    fillArray(process.argv[i]);
                setTimeout(() => {
                    console.log(files.length);
                    sendFile(files.pop());
                }, 5000);
            }
            break;
        case 'NEXT':
            if(files.length >= 1)
                sendFile(files.pop());
            else
                client.destroy();
            break;
        default:
            break;
    }
});

client.on('close', function () {
    console.log('Connection closed');
});

function sendFile(p_path){
    fs.readFile(p_path, (err, data) => {
        if(err) throw err;
        client.write('DATA ' + path.basename(p_path) + ' ' + data.toString('hex'));
    });
}

function fillArray(source_path) {
    fs.readdir(source_path, (err, file_names) => {
        if (err) throw err;
        file_names.forEach((file) => {
            file = source_path + path.sep + file;
            fs.stat(file, (err, stat) => {
                if (err) throw err;
                if (stat.isFile())
                    files.push(file);
                else
                    fillArray(file);
            });
        });
    });
}