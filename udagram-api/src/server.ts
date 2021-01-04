import cors from 'cors';
import express from 'express';
import {sequelize} from './sequelize';

import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_FEED_MODELS, V0_USER_MODELS} from './controllers/v0/model.index';


(async () => {
    await sequelize.addModels(V0_FEED_MODELS);
    await sequelize.addModels(V0_USER_MODELS);
    await sequelize.sync();

    const app = express();
    const port = process.env.BACKEND_PORT || 8080;
    console.log(`the environment port is ${process.env.BACKEND_PORT}`)

    app.use(bodyParser.json());

    app.use(cors({
        allowedHeaders: [
            'Origin', 'X-Requested-With',
            'Content-Type', 'Accept',
            'X-Access-Token', 'Authorization',
        ],
        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
        origin: '*',
    }));

    app.use('/api/v0/', IndexRouter);

    // Root URI call
    app.get('/', async (req, res) => {
        res.send('/api/v0/');
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running ${config.url} on port ${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();
