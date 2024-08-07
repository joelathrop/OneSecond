const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const PORT = process.env.PORT || 3000;


const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/selectLocation', (req, res) => {
    res.render('selectLocation');
});

app.get('/selectMode', (req, res) => {
    res.render('selectMode');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
