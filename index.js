const express = require('express');
const expressSession = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3000;
const bodyPraser = require('body-parser');

mongoose.connect('mongodb://admin:FRQzsm86491@node31966-js-checkin.app.ruk-com.cloud:27017/admin')
    .then(() => console.log('Connected to mongoDB'))
    .catch((err) => console.log('Connection failed, ' + err))

mongoose.set('debug', true);


// setup frontend
app.use(express.static(__dirname + '/www'));

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cors());
app.use(expressSession({
    secret: 'Jujuna because is secret',
    resave: false,
    saveUninitialized: true,
    cookie: { }
}));
app.use('/', require('./routes'));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));