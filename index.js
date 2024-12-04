const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());


try {
    const fileData = fs.readFileSync("data.json", "utf-8");
    articles = JSON.parse(fileData || "[]");
} catch (error) {
    console.error("Error reading or parsing data.json:", error.message);
    articles = [];
}



const saveToFile = () => {
    fs.writeFileSync("data.json", JSON.stringify(articles, null, 2));
};


app.post("/articles", (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content || !tags) {
        return res.status(400).json({ status: "error", error: "Missing fields" });
    }

    const newArticle = {
        id: articles.length + 1,
        title,
        content,
        tags,
        createdAt: new Date(),
    };

    articles.push(newArticle);
    saveToFile();

    res.status(201).json({ status: "success", data: newArticle });
});

// Endpoint: Search Articles
// Search Articles
// Search Articles by Keywords and Sort by Relevance or Date
app.get('/articles/search', (req, res) => {
    const { keyword, sortBy } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword query parameter is required' });
    }

    console.log(`Searching for keyword: ${keyword}`); // Log the keyword

    // Filter articles by keyword in title or content
    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log('Filtered articles:', filteredArticles); 
    if (sortBy === 'relevance') {
        filteredArticles.sort((a, b) => {
            const keywordCountA = (a.title.match(new RegExp(keyword, 'gi')) || []).length +
                (a.content.match(new RegExp(keyword, 'gi')) || []).length;

            const keywordCountB = (b.title.match(new RegExp(keyword, 'gi')) || []).length +
                (b.content.match(new RegExp(keyword, 'gi')) || []).length;

            return keywordCountB - keywordCountA;
        });
        console.log('Sorted by relevance:', filteredArticles); 
    } else if (sortBy === 'date') {
        filteredArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Sorted by date:', filteredArticles); 
    }

    res.json({ status: 'success', results: filteredArticles });
});


// Endpoint: Get Article by ID
app.get("/articles/:id", (req, res) => {
    const { id } = req.params;

    const article = articles.find((article) => article.id === parseInt(id));

    if (!article) {
        return res.status(404).json({ status: "error", error: "Article not found" });
    }

    res.json({ status: "success", data: article });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
