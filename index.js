const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();
const app = express();
const FormData = require('form-data');
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

let plantData = [];

// Charger le CSV au démarrage
fs.createReadStream("plantDatabase.csv")
    .pipe(csv())
    .on('data', (row) => plantData.push(row))
    .on('end', () => console.log('CSV chargé, total:', plantData.length));

// POST /identify -> use and image to identify a plant and return its name
app.post('/identify', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const imagePath = req.file.path;

        const formData = new FormData();
        formData.append('organs', 'leaf');
        formData.append('images', fs.createReadStream(imagePath));

        const headers = formData.getHeaders(); // Get headers for axios

        const response = await axios.post(
            `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`,
            formData,
            { headers }
        );

        // Extract the best match and top results
        const { bestMatch, results } = response.data;

        // Log the best match for debugging
        console.log('Best Match:', bestMatch);

        // Extract additional details from the top result
        const topResult = results?.[0];
        const speciesName = topResult?.species?.scientificNameWithoutAuthor || 'Unknown';
        const score = topResult?.score || 0;

        // Match with local plant database
        const match = plantData.find((row) =>
            row.name?.toLowerCase() === speciesName.toLowerCase()
        );

        // Respond with the identified plant and additional info
        res.json({
            bestMatch,
            identified: speciesName,
            confidence: score,
            info: match || 'No additional info found in local database.',
        });

        // Cleanup uploaded file
        fs.unlink(imagePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l’identification');
    }
});
//GET / DEBUG PURPOSE
app.get('/', (req, res) => {
    res.send('Backend en ligne ✅');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}
);

