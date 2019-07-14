#!/usr/bin/env node
const record = require('node-record-lpcm16');
const { Detector, Models }= require('snowboy');
const mqtt = require('mqtt');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const toml = require('toml');

const hotwordConfig = ini.parse(fs.readFileSync(path.join(__dirname, 'config.ini'), 'utf-8'));
const snipsConfig = toml.parse(fs.readFileSync(path.join('/etc', 'snips.toml'), 'utf-8'));

//
// Config
//
const CONFIG = {
    mqtt: snipsConfig['snips-common']['mqtt'] || 'localhost:1883',
    siteId: (snipsConfig['snips-audio-server']['bind'] || 'default@mqtt').split('@')[0],
    modelId: snipsConfig['snips-hotword']['hotword_id'] || 'default'
}

var client  = mqtt.connect(`mqtt://${CONFIG.mqtt}`);

client.on('connect', function () {
    console.log(`[Snips Hotword Log] Connected to MQTT broker ${CONFIG.mqtt}`);
    client.subscribe('hermes/hotword/#');
});

client.on('message', function (topic) {
    switch(topic) {
        case 'hermes/hotword/toggleOff':
            mic.pause();
            console.log('[Snips Hotword Log] Hotword detected, pausing Mic');
            break;
        case 'hermes/hotword/toggleOn':
            mic.resume();
            console.log('[Snips Hotword Log] Dialog ended, resuming Mic');
            break;
    }
});

const models = new Models();
{
    const { hotwordFile, sensitivity, hotwords } = hotwordConfig['global'];
    for (let i=0; i < hotwordFile.length; i++) {
        models.add({
            file: `models/${hotwordFile[i]}`,
            sensitivity: sensitivity[i],
            hotwords: hotwords[i].split(',')
        });
    }
}

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: parseFloat(hotwordConfig['global']['audioGain']),
  applyFrontend: hotwordConfig['global']['applyFrontend']
});

detector.on('error', function () {
  console.log('error');
});

detector.on('hotword', function (index, hotword) {
  console.log(`[Snips Hotword Log] Hotword ${hotword} with index ${index} detected, telling 'kitchen' to listen`);
  client.publish(`hermes/hotword/${CONFIG.siteId}/detected`, JSON.stringify({
    siteId: CONFIG.siteId,
    modelId: CONFIG.modelId
  }));
});

const mic = record.start({
  threshold: 0
});

mic.pipe(detector);
