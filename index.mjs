import axios from 'axios';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors'
import multer from 'multer'
import FormData from 'form-data'

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + '/public'));
app.use(cors());

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.get('/', async (req, res) => {
    res.sendFile('public/html/index.html', { root: __dirname });
});

app.post('/sendMessage', upload.array('files', 10), async (req, res) => {
    const JSONMessage = req.body;
    const form = new FormData();

    if (JSONMessage?.content != null)
        form.append('content', JSONMessage.content);
    if (JSONMessage?.avatar_url != null)
        form.append('avatar_url', JSONMessage.avatar_url);
    if (JSONMessage?.username != null)
        form.append('username', JSONMessage.username);

    for (let i = 0; i < req.files.length; i++) {
        form.append('files' + i, req.files[i].buffer, { filename: req.files[i].originalname });
    }

    try {
        await axios.post(JSONMessage.webhookUrl,
            form,
            { headers: 'Content-Type: multipart/form-data' });
    } catch (e) {
        return res.json({ success: false, error: e.response.data.message ?? e.message });
    }
    return res.json({
        success: true,
    });
});

app.post('/isWebhook', upload.single('fileData'), async (req, res) => {
    let webhookInfo;
    try {
        webhookInfo = (await axios.get(req.body.webhookUrl)).data;
    } catch (e) {
        return res.json({ success: false });
    }
    return res.json({
        success: true,
        name: webhookInfo.name,
        avatar: webhookInfo.avatar != null ? `https://cdn.discordapp.com/avatars/${webhookInfo.id}/${webhookInfo.avatar}.webp?size=512` : "https://cdn.discordapp.com/embed/avatars/0.png",
    });
});

app.listen(PORT, () => {
    console.log(`NortHook on, port: ${PORT}`);
});