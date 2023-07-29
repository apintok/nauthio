const CryptoJS = require('crypto-js');

module.exports = class Auth {
  constructor(config) {
    this.config = config;
    this.version = '1.0';
    this.method = 'HMAC-SHA256';
  }

  // Methods
  calculateNonce() {
    let nonce = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 32; i++) {
      nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
  }

  calculateTimestamp() {
    return Math.round(+new Date() / 1000);
  }

  calculateSignature(baseString) {
    const key = `${this.config.consumerSecret}&${this.config.tokenSecret}`;
    const hmacsha256Data = CryptoJS.HmacSHA256(baseString, key);
    const base64EncodedData = hmacsha256Data.toString(CryptoJS.enc.Base64);
    return encodeURIComponent(base64EncodedData);
  }

  getOAuth() {
    const params = this.paramfy(this.config.url);
    const data = this.encapsulateData(params);
    const encodedData = encodeURIComponent(data.dataString);
    const baseString = `${this.config.action}&${encodeURIComponent(
      params.newUrl
    )}&${encodedData}`;
    const signature = this.calculateSignature(baseString);

    return { signature, timestamp: data.timestamp, nonce: data.nonce };
  }

  buildHeader(timestamp, nonce, signature) {
    let authHeader = `OAuth realm="${this.config.realm}",`;
    authHeader += `oauth_consumer_key="${this.config.consumerKey}",`;
    authHeader += `oauth_token="${this.config.tokenId}",`;
    authHeader += `oauth_signature_method="${this.method}",`;
    authHeader += `oauth_timestamp="${timestamp}",`;
    authHeader += `oauth_nonce="${nonce}",`;
    authHeader += `oauth_version="${this.version}",`;
    authHeader += `oauth_signature="${signature}"`;

    return authHeader;
  }

  /**
   * * Function to separete the Request URL parameters if any;
   * * Separate the deploy & script parameters;
   * * Save the url without parameters for encoding later;
   * @param {String} url
   * @returns {Object}
   */
  paramfy(url) {
    let requestParams = url.split('?');
    const newUrl = requestParams[0];
    requestParams = requestParams[1].split('&');

    const script = requestParams.find((el) => {
      if (el.includes('script')) {
        return el;
      }
    });

    const deploy = requestParams.find((el) => {
      if (el.includes('deploy')) return el;
    });

    const others = requestParams.filter((el) => {
      if (!el.includes('deploy') && !el.includes('script')) {
        return el;
      }
    });

    return {
      newUrl,
      script,
      deploy,
      others
    };
  }

  /**
   * * Return the data ordered to be encoded
   * * Is necessary to sort() the parameters alphabetically for encoding
   * @param {*} parameters
   * @returns
   */
  encapsulateData(parameters) {
    let dataString = '';
    const nonce = this.calculateNonce();
    const timestamp = this.calculateTimestamp();

    const data = [
      `oauth_version=${this.version}`,
      `oauth_timestamp=${timestamp}`,
      `oauth_consumer_key=${this.config.consumerKey}`,
      `oauth_nonce=${nonce}`,
      `oauth_signature_method=${this.method}`,
      `oauth_token=${this.config.tokenId}`
    ];

    for (let i = 0; i < parameters.others.length; i++) {
      data.push(parameters.others[i]);
    }

    data.push(parameters.deploy);
    data.push(parameters.script);

    const arrange = data.sort();

    for (let i = 0; i < arrange.length; i++) {
      dataString += arrange[i] + '&';
    }
    dataString = dataString.slice(0, dataString.length - 1);

    return {
      dataString,
      timestamp,
      nonce
    };
  }
};
