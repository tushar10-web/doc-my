const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json()); // to parse JSON bodies

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  try {
    // Get language code from form field, default to English if not provided
    const lang = req.body.lang || 'eng';

    // Convert image buffer to base64
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // OCR with selected language(s)
    const result = await Tesseract.recognize(imageBase64, lang);
    
    console.log('Tesseract output:', result.data.text);
    res.json({ text: result.data.text });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Error extracting text from image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
