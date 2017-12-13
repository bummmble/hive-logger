import test from 'ava';
import Logger from '../src/index';

test.beforeEach(t => {
    t.context.logger = new Logger();
});

test('Empty String request body', t => {
    t.is(t.context.logger.getMetadata({
        method: 'GET',
        body: 'test'
    }).request.body, '');
    t.is(t.context.logger.getMetadata({
        method: 'HEAD',
        body: 'test'
    }).request.body, '');
});

test('POST with Object is parsed to request.body', t => {
    t.is(t.context.logger.getMetadata({
        method: 'POST',
        body: { test: 'test' }
    }).request.body, JSON.stringify({ test: 'test' }));
});

test('POST with Number is also parsed to request.body', t => {
    t.is(t.context.logger.getMetadata({
        method: 'POST',
        body: 1
    }).request.body, '1');
});

test('POST with String is also parsed to request.body', t => {
    t.is(t.context.logger.getMetadata({
        method: 'POST',
        body: 'test'
    }).request.body, 'test');
});

test('Should parse a user object', t => {
    t.is(t.context.logger.getMetadata({
        method: 'GET',
        user: {
            id: 'test'
        }
    }).user.id, 'test')
});

test('Should parse IP Address', t => {
    t.is(t.context.logger.getMetadata({
        method: 'GET',
        ip: '127.0.0.1'
    }).user.ip_address, '127.0.0.1');
});
