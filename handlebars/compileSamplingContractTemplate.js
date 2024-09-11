const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');

const express = require('express');
const app = express();

// Set up static file serving for images
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

// Set cache directory for Puppeteer
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, '.cache', 'puppeteer');
console.log(path.join(__dirname, '.cache', 'puppeteer'));

// Compile Handlebars template
const compile = async function(templateName, data) {
    const filePath = path.join(__dirname, 'public', 'views', `${templateName}.handlebars`);
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
};

// Function to retrieve purchase information and generate the PDF
// async function generatePdf(purchase) {
async function generateSamplingContractPdf(data) {
    try {
        let pdf_directory = path.join(__dirname, 'gsa-sampling-contracts');
        const file_name = await getFilePath(pdf_directory, data.documentNumber);

        console.log("Priting pdf file name: ", file_name);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const content = await compile('gsaSamplingContractTemplate', data);  // Pass the transformed purchase data
        
        // Compile to HTML file
        const htmlFilePath = path.join(__dirname, 'compiled-gsaSamplingContractTemplate.html');
        await fs.writeFile(htmlFilePath, content);

        await page.goto(`file:${htmlFilePath}`, { waitUntil: 'networkidle0' });

        const pdfPath = path.join(__dirname, 'gsa-sampling-contracts', file_name);
        // const pdfPath = path.join(__dirname, 'gsa-sampling-contracts', 'test-Sampling-contract.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        });

        console.log('PDF generated successfully.');
        await browser.close();

        return pdfPath;  // Return the path of the generated PDF
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Helper function to format the current date and time
function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
}

async function getFilePath(basePath, file_name) {
    const files = await fs.readdir(basePath);
    const matchingFiles = files.filter(file => file.startsWith(file_name) && file.endsWith('.pdf'));

    const newFileName = `${file_name}.pdf`; // Just the file name without the path
    
    if (matchingFiles.length === 0) {
        // No matching file, return the new file name as is
        return newFileName;
    } else {
        // If a matching file exists, rename it with a timestamp
        const timestamp = getTimestamp();
        const existingFilePath = path.join(basePath, matchingFiles[0]); // Assuming the first match
        const renamedFileName = `${file_name}_${timestamp}.pdf`;
        const renamedFilePath = path.join(basePath, renamedFileName);

        // Rename the existing file
        await fs.rename(existingFilePath, renamedFilePath);

        console.log(`Renamed existing file to ${renamedFileName}`);

        // Return the new file name (newFileName for the current file)
        return newFileName;
    }
}

(async () => {
    try {
        console.log(generateSamplingContractPdf());
    } catch (error) {
        console.error('Error: ', error);
    }
})

module.exports.generateSamplingContractPdf = generateSamplingContractPdf;