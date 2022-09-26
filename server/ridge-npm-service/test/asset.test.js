/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';
const fs = require('fs'),
    path = require('path'),
    AssetService = require('../src/assets_service.js'),
    storePath = path.resolve(__dirname, './test_store');

beforeAll(() => {
    fs.mkdirSync(storePath);
});

afterAll(() => {
    fs.rmdirSync(storePath, {
        recursive: true
    });
});

const assetsService = new AssetService({
    storage: storePath,
    npmServer: 'http://10.12.7.250:8081/repository/npm-group'
});

test('Base Init AssetService', async() => {
    await assetsService.installPackageTo('react', null, storePath + '/app/react');

    const installed = await assetsService.getInstalledPackages(storePath + '/app');

    expect(installed.length).toBe(1);

    expect(installed[0].name).toBe('react');
});

test('Install twice AssetService', async() => {
    await assetsService.installPackageTo('react', null, storePath + '/app/react');

    const installed = await assetsService.getInstalledPackages(storePath + '/app');

    expect(installed.length).toBe(1);

    expect(installed[0].name).toBe('react');
});

test('Install React and standard-data', async() => {
    await assetsService.installPackageTo('react', null, storePath + '/app1/react');

    await assetsService.installPackageTo('@gw/apollo-standard-data', null, storePath + '/app1/@gw/apollo-standard-data');

    const installed = await assetsService.getInstalledPackages(storePath + '/app1');

    expect(installed.length).toBe(2);
});

test('Fcp List', async() => {
    await assetsService.installPackageTo('@gw/apollo-standard-data', null, storePath + '/app1/@gw/apollo-standard-data');

    const fcpList = await assetsService.getPackageFcpList(storePath + '/app1/@gw/apollo-standard-data');

    expect(fcpList.length > 0).toBeTruthy();

    expect(fcpList[0].endsWith('fcp.js')).toBeTruthy();
});
