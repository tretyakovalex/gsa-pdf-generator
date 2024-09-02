const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const moment = require('moment');

const { generatePdf } = require('../../handlebars/compiledHandlebars.js');

const axios = require('axios');
const FormData = require('form-data');


// getting data (including mysql) for invoice pdf generation
router.post('/generateInvoicePdf', async (req, res) => {
    try {
        const data = req.body;

        let invoice_file_path = await generatePdf(data);

        console.log(invoice_file_path); 

        // --- send generated invoice to server ---
        const form = new FormData();
        form.append('pdf', fs.createReadStream(invoice_file_path));
        
        // Send the PDF file to Server 1
        axios.post('http://localhost:4000/upload-invoice-pdf', form, {
            headers: {
                ...form.getHeaders()
            }
        })
        .then(response => {
            console.log('Invoice PDF sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending PDF:', error);
        });
        // ----------------------------------------

    } catch (error) {
        console.error(error);
    }
})

router.get('/getGsaInvoices', async (req, res) => {
    try {
        let files = fs.readdirSync(path.join(__dirname, '..', '..', 'handlebars', 'gsa-invoices'));
        const file_path = files.filter(file => file.endsWith('.pdf'));
        console.log("file paths: ", file_path)

        let pdf_files = await getFileCreatedDate(file_path);
        console.log(pdf_files);

        res.json(pdf_files);
    } catch (error) {
        console.error(error);
    }
});

router.get('/getInvoiceByName', async (req, res) => {
    try {
        const file_name = req.query.file_name;

        let file_location = path.join(__dirname, '..', '..', 'handlebars', 'gsa-invoices', file_name);
        console.log("printing file location: ", file_location);
        
        res.download(file_location);
        
    } catch (error) {
        console.error(error);
    }
});

router.get('/getInvoiceByDate', async (req, res) => {
    try {
        const date = req.query.date;
        
        let files = fs.readdirSync(path.join(__dirname, '..', '..', 'handlebars', 'gsa-invoices'));
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

async function getFileCreatedDate(file_path){
    let pdf_files = await Promise.all(file_path.map(async (file) => {
        const file_path = path.join(__dirname, '..', '..', 'handlebars', 'gsa-invoices', file);
        const stat = await fs.stat(file_path);
        if (stat) {
            return { file_name: file, created: stat.birthtime };
        }
    }));

    return pdf_files;
}

module.exports = router;