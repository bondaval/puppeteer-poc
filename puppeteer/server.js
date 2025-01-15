const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());  // Middleware to parse JSON request bodies

app.post('/generate-pdf', async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).send({ error: 'HTML content is required' });
    }

    try {
        // When Chromium runs in a sandboxed environment, operations that are considered potentially dangerous
        // (like accessing system files or interacting with other applications) are restricted. SO we disable it here.
        // especially seeing as we're doing this in a docker container.
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf();

        await browser.close();
        res.contentType('application/pdf');
        res.send(pdf);  // Send the generated PDF as the response
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, () => console.log('Puppeteer service running on port 3000'));
