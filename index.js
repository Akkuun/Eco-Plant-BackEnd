const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

let plantData = [];

// Charger le CSV au démarrage
fs.createReadStream("plantDatabase.csv")
    .pipe(csv())
    .on('data', (row) => plantData.push(row))
    .on('end', () => console.log('CSV chargé, total:', plantData.length));

// app.post('/identify', upload.single('image'), async (req, res) => {
//     try {
//         const imagePath = req.file.path;

//         const formData = new FormData();
//         formData.append('organs', 'leaf');
//         formData.append('images', fs.createReadStream(imagePath));

//         const response = await axios.post(
//             `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`,
//             formData,
//             { headers: formData.getHeaders() }
//         );

//         const results = response.data.results;
//         const bestMatch = results?.[0]?.species?.scientificNameWithoutAuthor || 'Unknown';

//         const match = plantData.find((row) =>
//             row.name?.toLowerCase() === bestMatch.toLowerCase()
//         );

//         res.json({
//             identified: bestMatch,
//             info: match || 'No additional info found in local database.',
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Erreur lors de l’identification');
//     }
// });

app.listen(port, () => console.log(`Serveur en écoute sur le port ${port}`));
