import express from 'express';
import cors from 'cors'
import multer from 'multer'
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

app.listen(PORT, () => {
    console.log(`NortHook on, port: ${PORT}`);
});