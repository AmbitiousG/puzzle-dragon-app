const request= require("request");

function getImage() {
  request({
    url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
    encoding: null
  }, (err, res, body) => {
    console.log(12);

  });

}

getImage();
