import test from 'ava';
import { createServer } from 'bummmble-hive';
import supertest from 'supertest';
import Logger from '../src/index';

test.cb.beforeEach(t => {
    const server = createServer({});
    const logger = new Logger();
    server.use(logger.middleware);
    t.context.app = server;
    t.context.server = server.listen(() => {
        t.end();
    });
});

test.cb('Tests req.logger', t => {
    t.context.app.use((req, res) => {
        t.true(typeof req.logger === 'function');
        req.logger('log', 'test');
        res.send('ok');
    });
    const request = supertest(t.context.server);
    request.get('/').end(() => t.end());
});

test.cb('Tests req.logger.warn', t => {
    t.context.app.use((req, res) => {
        t.true(typeof req.logger.warn === 'function');
        req.logger.warn('test');
        res.send('ok');
    });
    const request = supertest(t.context.server);
    request.get('/').end(() => t.end());
});

