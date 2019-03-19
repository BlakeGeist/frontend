const _ = require('lodash');
const pdfMaker = require('pdf-maker');
const cheerio = require('cheerio');
const fs = require('fs');
const wait = require('co-wait');
const send = require('koa-send');
const parse = require('co-body');

function * generatePDF() {
  try {
    var body = yield parse.json(this.req);
    // console.log("generatePDF "+JSON.stringify(body));

    var dir = __dirname + '/../../../pdf-templates/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    var fileName = __dirname + '/../../../pdf-templates/transactionHTML.html';

    var stream = fs.createWriteStream(fileName);

    const $ = cheerio.load(buildTransactionHTML(body.html));

    $(".transaction-list th").css("border-bottom", "1px solid #ddd");
    $(".transaction-list th").css("padding", "15px");
    $(".transaction-list td").css("border-bottom", "1px solid #ddd");
    $(".transaction-list td").css("padding", "15px");
    $(".cash-back-active-content-missing-purchase").remove();

    yield streamHtml(stream, $.html());

    var template = __dirname + '/../../../pdf-templates/transactionHTML.html';
    var pdfPath = __dirname + '/../../../pdf-templates/transactions.pdf';
    var option = {
      paperSize: {
        format: 'A2',
        orientation: 'portrait',
        border: '0.5cm'
      }
    };

    pdfMaker(template, pdfPath, option);

    yield wait(5000);

    var rootFolder = __dirname.replace("src/backend/dynamic", "");

    yield send(this, "/pdf-templates/transactions.pdf", {root: rootFolder});

    yield deleteFile(__dirname + "/../../../pdf-templates/transactionHTML.html");
    yield deleteFile(__dirname + "/../../../pdf-templates/transactions.pdf");

  } catch (e) {
    console.log(e);
  }
  this.status = 200;
}

function buildTransactionHTML(html) {
  return html;
}

function streamHtml(stream, html) {
  var fd = new Promise(function(resolve, reject) {
    stream.once('open', function(fd) {
      stream.end(html);
      resolve(fd);
    }).on('error', function (e) {
      reject(e);
    });
  });
  return fd;
}

function deleteFile(path) {
  var fd = new Promise(function(resolve, reject) {
    fs.unlink(path, function (error) {
      if(error) {
        reject(error);
      } else {
        resolve();
      }
    })
  });
  return fd;
}

module.exports = generatePDF;
