const CryptoJS = require('crypto-js');

module.exports = class Auth {
  constructor(config) {
    this.config = config;
    this.version = '1.0';
    this.method = 'HMAC-SHA256';
  }

  // ? Methods
  /**
   * * Returns a number string of characters
   * @returns {String} nonce
   */
  calculateNonce() {
    let nonce = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 32; i++) {
      nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
  }

  /**
   * * Returns a UNIX number
   * @returns {Number} timpestamp
   */
  calculateTimestamp() {
    return Math.round(+new Date() / 1000);
  }

  /**
   * * Calculates the signature string based on key and token details
   * @param {String} baseString 
   * @returns The encoded signature for the request authentication
   */
  calculateSignature(baseString) {
    const key = `${this.config.consumerSecret}&${this.config.tokenSecret}`;
    const hmacsha256Data = CryptoJS.HmacSHA256(baseString, key);
    const base64EncodedData = hmacsha256Data.toString(CryptoJS.enc.Base64);
    return encodeURIComponent(base64EncodedData);
  }

  /**
   * * Returns the authentication needed details: signature, timestap & nonce
   * @returns {Object}
   */
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

  /**
   * * Concates together all the necessary info for the Authentication Header of the request
   * @returns {String} authHeader
   */
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
   * * Including the deploy & script parameters;
   * * Return the url without parameters for encoding later;
   * @param {String} url
   * @returns {Object}
   */
  paramfy(url) {
    let requestParams = url.split('?');
    const newUrl = requestParams[0];
    const params = requestParams[1].split('&');

    return {
      newUrl,
      params
    };
  }

  /**
   * * Return the data ordered to be encoded
   * * Is necessary to sort() the parameters alphabetically for encoding
   * @param {Object} parameters
   * @returns
   */
  encapsulateData(parameters) {
    const nonce = this.calculateNonce();
    const timestamp = this.calculateTimestamp();

    console.log('Parameters >>> ', parameters);

    const data = [
      `oauth_version=${this.version}`,
      `oauth_timestamp=${timestamp}`,
      `oauth_consumer_key=${this.config.consumerKey}`,
      `oauth_nonce=${nonce}`,
      `oauth_signature_method=${this.method}`,
      `oauth_token=${this.config.tokenId}`
    ];

    parameters.params.forEach((param) => data.push(param));

    const arrange = data.sort();

    let dataString = arrange.reduce(
      (acc, currValue) => (acc += currValue + '&'),
      ''
    );
    dataString = dataString.slice(0, dataString.length - 1);

    return {
      dataString,
      timestamp,
      nonce
    };
  }
};
