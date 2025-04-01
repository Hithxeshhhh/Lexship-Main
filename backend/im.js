const imagemagick = require('imagemagick');

imagemagick.convert(['input.tif', '-compress', 'LZW', 'output.tif'], (err, stdout) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Conversion successful:', stdout);
  }
});
