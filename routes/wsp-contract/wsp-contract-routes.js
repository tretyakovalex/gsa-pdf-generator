const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { generateWSPContractPdf } = require('../../handlebars/compileWSPContractTemplate.js');

router.post('/generateWSPContractPdf', async (req, res) => {
    try {
        const data = req.body;
        let wsp_contract_file_path = await generateWSPContractPdf(data);

        console.log("wsp_contract_file_path: ", wsp_contract_file_path);

        const file_name = wsp_contract_file_path.match(/[^\/]+$/)[0];
        let file_location = path.join(__dirname, '..', '..', 'handlebars', 'wsp-contracts', file_name);
        console.log("printing file location: ", file_location);

        res.download(file_location);

    } catch (error) {
        console.error(error);
    }
});

// router.get('/generateWSPContractPdf', async (req, res) => {
//     try {
//         let wsp_contract_file_path = await generateWSPContractPdf();

//         console.log("wsp_contract_file_path: ", wsp_contract_file_path);

//         const file_name = wsp_contract_file_path.match(/[^\/]+$/)[0];
//         let file_location = path.join(__dirname, '..', '..', 'handlebars', 'wsp-contracts', file_name);
//         console.log("printing file location: ", file_location);

//         res.download(file_location);

//     } catch (error) {
//         console.error(error);
//     }
// });

module.exports = router;