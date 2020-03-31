[![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/assorium/comitet-tgrm-bot?style=for-the-badge "Docker Cloud Automated build")](https://hub.docker.com/r/assorium/comitet-tgrm-bot "Docker Cloud Automated build")
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/assorium/comitet-tgrm-bot?style=for-the-badge "Docker Cloud Build Status")](https://hub.docker.com/r/assorium/comitet-tgrm-bot "Docker Cloud Build Status")
[![Docker Pulls](https://img.shields.io/docker/pulls/assorium/comitet-tgrm-bot?style=for-the-badge "Docker Pulls")](https://hub.docker.com/r/assorium/comitet-tgrm-bot "Docker Pulls")  <br/>

[![Latest Github tag](https://img.shields.io/github/v/tag/mrspartak/comitet-tgrm-bot?sort=date&style=for-the-badge "Latest Github tag")](https://github.com/mrspartak/comitet-tgrm-bot/releases "Latest Github tag")

## Environment variables
Dotenv support. You can create .env file with this variables in the app folder 
```
const PORT = +process.env.PORT || 3019;
const DEBUG = process.env.DEBUG || false;
//webhook token
const TOKEN = process.env.TOKEN || false;

//API keys
const TJ_KEY = process.env.TJ_KEY || false;
const VC_KEY = process.env.VC_KEY || false;
const DTF_KEY = process.env.DTF_KEY || false;
```

## Docker
```
docker run -p 3019:3019 --name cmtt-bot-tgrm \
  -e TOKEN=123 -e TJ_KEY=123 \
  assorium/comitet-tgrm-bot:latest
```

## Usage
Subscribe to webhooks https://www.notion.so/dd8bf6f5c1fd430286530644d4c362df  
You url is http://[APP_IP]:3019/webhook_tj?token=[TOKEN] 

Webhook path:
webhook_tj  
webhook_dtf  
webhook_vc  