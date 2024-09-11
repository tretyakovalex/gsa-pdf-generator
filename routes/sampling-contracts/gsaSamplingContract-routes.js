const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { generateSamplingContractPdf } = require('../../handlebars/compileSamplingContractTemplate.js');

router.post('/generateSamplingContractPdf', async (req, res) => {
    try {
        const data = req.body;
        let sampling_contract_file_path = await generateSamplingContractPdf(data);

        console.log("sampling_contract_file_path: ", sampling_contract_file_path);

        const file_name = sampling_contract_file_path.match(/[^\/]+$/)[0];
        let file_location = path.join(__dirname, '..', '..', 'handlebars', 'gsa-sampling-contracts', file_name);
        console.log("printing file location: ", file_location);

        res.download(file_location);

    } catch (error) {
        console.error(error);
    }
});

module.exports = router;