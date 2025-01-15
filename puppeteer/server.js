const express = require('express');
const puppeteer = require('puppeteer');
const {readFileSync} = require("node:fs");
const {join} = require("node:path");

const app = express();
app.use(express.json());

app.get('/generate-pdf/:pdfName', async (req, res) => {
    // An example of how we could switch which PDF we wanted. pdf template name is passed in as a URL param.
    const htmlFilePath = join(__dirname, 'pdfTemplates', `${req.params.pdfName}.html`);

    let html;
    try {
        html = readFileSync(htmlFilePath, 'utf8');
    } catch (error) {
        return res.status(500).send({ error: `Error reading HTML file: ${error.message}` });
    }

    try {
        // When Chromium runs in a sandboxed environment, operations that are considered potentially dangerous
        // (like accessing system files or interacting with other applications) are restricted. SO we disable it here.
        const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
        const page = await browser.newPage();

        // Set the content of the page
        await page.setContent(html);

        // Wait for the body so we know the page has loaded.
        await page.waitForSelector('body');

        const pdf = await page.pdf({
            format: 'A4',  // Make sure the PDF is A4 size
            printBackground: true,  // Include background graphics (if any)
        });

        await browser.close();
        res.contentType('application/pdf');
        res.send(pdf);  // Send the generated PDF as the response
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, () => console.log('Puppeteer service running on port 3000'));
