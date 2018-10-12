const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;
let logger;

const server = net.createServer((client) => {
    client.id = Date.now();
    logger = fs.createWriteStream('client_' + client.id + '.log');
    logger.write('Client ' + client.id + ' connected\n');
    client.setEncoding('utf8');

    client.on('data', (data) => {
        dataHandler(data, client, logger)
    });

    client.on('end', () => logger.write('Client ' + client.id + ' disconnected\n'));
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function dataHandler(p_data, client, logger) {
    let data = p_data.split(' ');
    switch (data[0]) {
        case 'FILES':
            client.write('ACK');
            break;
        case 'DATA':
            createFile(client.id, data[1], data[2]);
            client.write('NEXT');
            break;
        default:
            console.log('Disconnet client!')
            client.write('DEC');
            break;
    }
}

///TODO: 6 and 7 ex

function createFile(p_id, p_name, p_data_hex) {
    if (!fs.existsSync('./received_files/' + p_id))
        fs.mkdir('./received_files/' + p_id, () => {
            fs.writeFile('./received_files/' + p_id + path.sep + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
                if (err) throw err;
                logger.write('Create ./' + p_id + '/' + p_name + '\n');
            });
        });
    else
        fs.writeFile('./received_files/' + p_id + path.sep + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
            if (err) throw err;
            logger.write('Create ./' + p_id + '/' + p_name + '\n');
        });
}