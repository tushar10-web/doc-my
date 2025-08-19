const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Debug: Log received language code
  console.log('Received language:', req.body.lang);

  try {
    const lang = req.body.lang || 'eng'; // default English

    // Convert image buffer to base64 data URI
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Recognize text with Tesseract, loading langs from official CDN
    const result = await Tesseract.recognize(imageBase64, lang, {
      langPath: 'https://tessdata.projectnaptha.com/4.0.0_best', // official traineddata CDN
      logger: (m) => console.log(m), // log progress for debugging
    });

    console.log('Tesseract extracted text:', result.data.text);
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
