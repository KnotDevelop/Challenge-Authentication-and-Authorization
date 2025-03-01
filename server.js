const express = require('express');
const dotenv = require('dotenv');
const router = require('./router/router');
const error = require('./utils/errorHandle');

const app = express();
const port = 5432;

app.use(express.json({ limit: "200kb" }));
dotenv.config({ path: './config.env' });

app.use('/api/v1', router)
app.use('*', (req, res, next) => {
    error.mapError(404, 'Path not found.', next);
});

app.use(error.apiError);

app.listen(port, () => {
    console.log('server is running on port', port);
})