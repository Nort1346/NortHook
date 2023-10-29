import axios from 'axios';
import express from 'express';
import cors from 'cors'
import multer from 'multer'
import FormData from 'form-data'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
    const payload = {};

    if (JSONMessage?.content != null)
        payload.content = JSONMessage.content

    if (JSONMessage?.avatar_url != null)
        payload.avatar_url = JSONMessage.avatar_url;

    if (JSONMessage?.username != null)
        payload.username = JSONMessage.username;

    JSONMessage.embeds = await JSON.parse(JSONMessage.embeds);

    if (JSONMessage?.embeds != null && Object.keys(JSONMessage.embeds[0]).length > 1) {
        payload.embeds = JSONMessage.embeds;
    }

    form.append('payload_json', JSON.stringify(payload));

    for (let i = 0; i < req.files.length; i++) {
        form.append('files' + i, req.files[i].buffer, { filename: req.files[i].originalname });
    }

    try {
        await axios.post(JSONMessage.webhookUrl,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                }
            });
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