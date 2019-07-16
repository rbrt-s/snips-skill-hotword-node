# Snips custom hotword skill

Custom Hotword detection with Snowboy in NodeJS

## Requirements: NodeJS 8.x.x

Requirements for `node-record-lpcm16`:

```
sudo apt-get install sox libsox-fmt-all
```

## Installation

```
sam install actions -g https://github.com/rbrt-s/snips-skill-hotword-node.git
```

When using Pulseaudio, make sure to give the `_snips-skills` user access to the `pulse-access` group:

```
sudo usermod -a -G pulse-access _snips-skills
```

## Deactivate Default Snips hotword service

// CHECK TYPING
```
sudo systemctl stop snips-hotword.service
sudo systemctl disable snips-hotword.service
```

## Configuration

To configure multiple hotwords

```
[global]
hotwordFile[]=jarvis.umdl
sensitivity[]=0.75,0.75
hotwords[]=jarvis,jarvis

hotwordFile[]=mycustommodel.pmdl
sensitivity[]=0.5
hotwords[]=mycustommodel

applyFrontend=true
audioGain=2.0
```