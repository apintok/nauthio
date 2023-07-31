# nauthio

JavaScript Library for NetSuite Auth 1.0. This library goal is to help speed up the setup of the authentication steps needed to set Token-Based Authentication with the NetSuite ERP System.

# Installation

Requirements:

- Node.js
- npm (Node.js package manager)

```bash
  npm install nauthio
```

# Usage

```bash
    npm install nauthio
```

Modular include:

```
    const Nauthio = require('nauthio');
```

Build the NetSuite Config Object which contains the authenticaion and request details

```
    const nsConfig = {
        url: 'https://<account>.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=100&deploy=1',
        realm: '<ACCOUnT>',
        action: 'POST',
        tokenId: '55fe716',
        tokenSecret: '9730db3',
        consumerKey: '99cf05a',
        consumerSecret: '1886909'
    };
```

Create a new Nauthio instance with the config object

```
    const auth = new Nauthio(nsConfig);
```

Use the method .getOAuth. It'll use the config data

```
    const oAuth = auth.getOAuth();
```

The .buildHeader() methods returns the header

```
    const header = auth.buildHeader(oAuth);

    const authHeader = {
    'Authorization': header,
    'Content-Type': 'application/json'
    };
```

Pass the header to the respective request.

# Statistics

![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/apintok/nauthio)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/apintok/nauthio/main)
![GitHub](https://img.shields.io/github/license/apintok/nauthio)
![GitHub language count](https://img.shields.io/github/languages/count/apintok/nauthio)

# Social

![GitHub Repo stars](https://img.shields.io/github/stars/apintok/nauthio)
![GitHub forks](https://img.shields.io/github/forks/apintok/nauthio)
![GitHub watchers](https://img.shields.io/github/watchers/apintok/nauthio)
