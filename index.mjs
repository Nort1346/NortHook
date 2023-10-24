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
    const JSONMessage = req.body;
    try {
        await axios.post(JSONMessage.webhookUrl, JSONMessage);
    } catch (e) {
        console.log(e.response.data.message);
        return res.json({ success: false, error: e.response.data.message });
    }
    return res.json({ success: true });
});

app.post('/isWebhook', async (req, res) => {
    try {
        await axios.get(req.body.webhookUrl);
    } catch (e) {
        return res.json({ success: false });
    }
    return res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`NortHook on, port: ${PORT}`);
});

export async function postMessage(JSONMessage) {
    try {
        await axios.post(JSONMessage.webhookUrl, JSONMessage);
    } catch (e) {
        return false;
    }
    return true;
}