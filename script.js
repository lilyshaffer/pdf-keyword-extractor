document.getElementById("extract-button").addEventListener("click", extractKeywords);

function extractKeywords() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload a PDF file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        extractTextFromPDF(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
}

function extractTextFromPDF(arrayBuffer) {
    // Initialize PDF.js
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    loadingTask.promise
        .then(function(pdf) {
            let textContent = "";
            const numPages = pdf.numPages;

            // Extract text from all pages
            let pagePromises = [];
            for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
                pagePromises.push(pdf.getPage(pageNumber).then(function(page) {
                    return page.getTextContent();
                }));
            }

            // Wait for all pages' text to be extracted
            Promise.all(pagePromises)
                .then(function(pages) {
                    pages.forEach(function(page) {
                        page.items.forEach(function(item) {
                            textContent += item.str + " ";
                        });
                    });

                    // Process the extracted text
                    const keywords = extractKeywordsFromText(textContent);
                    displayKeywords(keywords);
                })
                .catch(function(error) {
                    console.error("Error extracting text from PDF:", error);
                });
        })
        .catch(function(error) {
            console.error("Error loading PDF:", error);
        });
}

function extractKeywordsFromText(text) {
    // Remove non-alphabet characters and split text into words
    const words = text.replace(/[^a-zA-Z\s]/g, "").toLowerCase().split(/\s+/);

    // Remove duplicates and numbers
    const uniqueWords = new Set(words.filter(word => isNaN(word) && word.length > 1));

    return Array.from(uniqueWords).sort();
}

function displayKeywords(keywords) {
    const output = document.getElementById("keywords-output");
    if (keywords.length === 0) {
        output.textContent = "No keywords found.";
    } else {
        output.textContent = keywords.join(", ");
    }
}
