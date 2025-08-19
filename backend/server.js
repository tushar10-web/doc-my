const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const imageBuffer = req.file.buffer;
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('language', req.body.lang || 'eng');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        apikey: 'helloworld', // free demo API key, get your own for production
      },
    });
    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      return res.status(500).json({ error: data.ErrorMessage || 'OCR error' });
    }

    const extractedText = data.ParsedResults?.map(r => r.ParsedText).join('\n') || 'No text extracted';
    res.json({ text: extractedText });
  } catch (error) {
    console.error('OCR API error:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
