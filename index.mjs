import axios from 'axios';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
    res.sendFile('public/html/index.html', { root: __dirname });
});

app.post('/sendMessage', async (req, res) => {

    let post = postMessage(req.body);

    return res.json({ success: post });
});

app.listen(PORT, () => {
    console.log(`NortHook on, port: ${PORT}`);
});

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

export function postMessage(JSONMessage) {
    if(!isValidURL(JSONMessage.webhookUrl)) {
        return false;
    }

    try {
        axios.post(JSONMessage.webhookUrl, JSONMessage);
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
}