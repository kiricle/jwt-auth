require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const router = require('./router/index');
const errorMiddleware = require('./middleware/errorMiddleware');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        app.listen(PORT, () => console.log('Server started on port ' + PORT));
    } catch (error) {
        console.log(error);
    }
};

start();

