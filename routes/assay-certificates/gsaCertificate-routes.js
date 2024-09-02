const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const FormData = require('form-data');


// const { generateInvoice } = require('../invoices/generate-invoice.js');
const { generateCertificatePdf } = require('../../handlebars/compileCertificateTemplate.js');

const axios = require('axios');
// router.get('/getGSACertificate', async (req, res) => {
//     try {
//         const query = `SELECT * FROM gsa_certificate`;
//         pool.query(query, (err, gsaCertificate) => {
//             if(err){
//                 console.error(err);
//                 return res.status(500).send('Internal Server Error');
//             }

//             res.json({ gsaCertificates: gsaCertificate });
//         });
//     } catch (error) {
//         console.error(error);
//     }
// });

// getting data (including mysql) for invoice pdf generation
router.post('/generateAssayCertificatePdf', async (req, res) => {
    try {
        const data = req.body;

        console.log("Priting data: ", data);
        let assay_certificate_file_path = await generateCertificatePdf(data);

        console.log("assay_certificate_path: ", assay_certificate_file_path); 

        // --- send generated invoice to server ---
        const form = new FormData();
        form.append('pdf', fs.createReadStream(assay_certificate_file_path));
        
        // Send the PDF file to Server 1
        axios.post('http://localhost:4000/upload-assay-certificate-pdf', form, {
            headers: {
                ...form.getHeaders()
            }
        })
        .then(response => {
            console.log('Assay Certificate PDF sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending PDF:', error);
        });
        // ----------------------------------------

    } catch (error) {
        console.error(error);
    }
})

router.post('/addGSACertificate', async (req, res) => {
    try {
        const data = req.body;

        console.log(data);

        const pdfPath = await generateCertificate(data);

        await generateInvoice(data.Sample_No, data.release_date);

        let file_name = pdfPath.replace("/Users/karlembeast/builds/projects/gsa-web/backend/handlebars/gsa-certificates/", "");
        console.log("printing file name: ", file_name);

        res.json({file_name: file_name});
        
    } catch (error) {
        console.error(error);
    }
});

router.get('/generateCertificate', async (req, res) => {
    try {
        const data = req.body;
        // console.log("Printing data: ", data);

        generateCertificate(data);
    } catch (error) {
        console.error(error);
    }
})

// // === Getting Generated Certificates ===
// router.get('/getAllCertificates', async (req, res) => {
//     try {
//         let files = fs.readdirSync(path.join(__dirname, '..', 'handlebars', 'gsa-certificates'));
//         const file_path = files.filter(file => file.endsWith('.pdf'));
//         console.log("file paths: ", file_path)

//         let pdf_files = await getFileCreatedDate(file_path);
//         console.log(pdf_files);

//         res.json(pdf_files);
//     } catch (error) {
//         console.error(error);
//     }
// });

router.get('/getCertificateByDate', async (req, res) => {
    try {
        const date = req.query.date;
        
        let files = fs.readdirSync(path.join(__dirname, '..', 'handlebars', 'gsa-certificates'));
        const file_path = files.filter(file => file.endsWith('.pdf'));
        console.log("file paths: ", file_path);

        let pdf_files = await getFileCreatedDate(file_path);

        // console.log(pdf_files);
        console.log(date);

        let filtered_pdfs = [];
        pdf_files.forEach((item) => {
            if(moment(item.created).format('YYYY-MM-DD') === date){
                filtered_pdfs.push({file_name: item.file_name, created: item.created});
            }
        });

        console.log("filtered pdf files: ", filtered_pdfs);

        res.json(filtered_pdfs);
    } catch (error) {
        console.error(error);
    }
});

router.get('/getCertificateByFileName', async (req, res) => {
    try {
        const file_name = req.query.file_name;
        
        // const pdfData = await fs.promises.readFile(path.join(__dirname, "..", "handlebars", 'gsa-certificates', file_name));
        
        let file_location = path.join(__dirname, '..', 'handlebars', 'gsa-certificates', file_name);
        console.log("printing file location: ", file_location);

        res.download(file_location);

        // sendMessageForCertificateComponent(pdfData);

        // res.status(200).json({ message: 'PDF generated and sent to clients', pdfData: buffer.toString('base64') });

    } catch (error) {
        console.error(error);
    }
});
// ======================================

// === Helper functions ===
async function getFileCreatedDate(file_path){
    let pdf_files = await Promise.all(file_path.map(async (file) => {
        const file_path = path.join(__dirname, '..', 'handlebars', 'gsa-certificates', file);
        const stat = await fs.stat(file_path);
        if (stat) {
            return { file_name: file, created: stat.birthtime };
        }
    }));

    return pdf_files;
}
// ========================

module.exports = router;