const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8123;
let logger;
let connections = 0;
// let dir = process.env.defaultDir;
// let maxConn = parseInt(process.env.MaxConn);
let dir = './received_files/';
let maxConn = 3;

const server = net.createServer((client) => {
    if (++connections > maxConn) {
        client.destroy();
    }
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
            console.log('Disconnect client!')
            client.write('DEC');
            break;
    }
}

function createFile(p_id, p_name, p_data_hex) {
    if (!fs.existsSync(dir + p_id))
        fs.mkdir(dir + p_id, () => {
            fs.writeFile(dir + p_id + '/' + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
                if (err) throw err;
                logger.write('Create ' + dir + '/' + + p_id + '/' + p_name + '\n');
            });
        });
    else
        fs.writeFile(dir + p_id + path.sep + p_name, Buffer.from(p_data_hex, 'hex'), (err) => {
            if (err) throw err;
            logger.write('Create ./' + p_id + '/' + p_name + '\n');
        });
}