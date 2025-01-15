package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type PdfRequest struct {
	HTML string `json:"html"`
}

func main() {
	htmlContent := "<html><body><h1>Hello, Puppeteer!</h1></body></html>"
	requestBody, err := json.Marshal(PdfRequest{HTML: htmlContent})
	if err != nil {
		panic(err)
	}

	resp, err := http.Post("http://localhost:3000/generate-pdf", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		panic(fmt.Sprintf("Error: %s", body))
	}

	// Save the PDF to a file
	pdf, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("output.pdf", pdf, 0644)
	if err != nil {
		panic(err)
	}

	fmt.Println("PDF saved as output.pdf")
}
