const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const app = express();

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  try {
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await Tesseract.recognize(imageBase64, 'eng');

    console.log('Tesseract output:', result.data.text); // Log raw output for debugging

    res.json({ text: result.data.text }); // Send as JSON
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Error extracting text from image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
