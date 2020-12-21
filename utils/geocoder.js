const NodeGeoCoder = require('node-geocoder');
const options = {
    httpAdapter:'https',
    provider: process.env.GEO_CODER_PROVIDER,
    apiKey: process.env.GEO_COER_API_KEY,
    formatter: null // 'gpx', 'string', ...
  };
   
  const geocoder = NodeGeoCoder(options);
  console.log(`geocoder is ${JSON.stringify(geocoder)}`.red);
  console.log(`geocoder options is ${JSON.stringify(options)}`.red);

   module.exports= geocoder;
  // Using callback
