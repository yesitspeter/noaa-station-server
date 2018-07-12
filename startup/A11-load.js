
const DBMigrate = require('db-migrate');

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const PromiseFtp = require('promise-ftp');
const URL = require('url');
const zlib = require('zlib');
const gzip = zlib.createGunzip();
const readline = require('readline');
const csv = require('csv-parse')
const moment = require('moment');
const seach = require('stream-each');

var byLine = require('byline');

const FLUSH_WHEN = 15000;

var conversions = {

  ghcnDate: function(val){

       var m =  moment.utc(val, 'YYYYMMDD');

       return m.toDate();


  },
    integer: function(val){


      if(val == "")
          return null;

        var result =  parseInt(val);

        if(isNaN(result))
            return null;

        return result;


    },
    dec: function(val){


        if(val == "")
            return null;

        var result =  parseFloat(val);

        if(isNaN(result))
            return null;

        return result;

    }

};


function mapToSpec(data, specFile)
{
    var out = {};

     for(var i = 0; i < Math.min(data.length, specFile.columns.length); ++i)
     {

         var col = specFile.columns[i];

         if(col)
         {
             out[col] = data[i].trim();

             if(('conversions' in specFile) && (col in specFile.conversions))
             {
                 var conv = specFile.conversions[col];

                 if(conversions[conv])
                     out[col] = conversions[conv](out[col]);


             }


         }



     }
    return out;

}

function process(specFile, config)
{

    switch(specFile.format || "CSV")
    {
        case "CSV":
            return processCSV(specFile, config);


        case "SSV":
            return processSSV(specFile, config);

    }

}
function splitAlongPoints(data, specFile)
{

    var substrs = [];
    var pt = 0;
    var last = 0;
    for(var i = 0; i < specFile.splitPoints.length; ++i)
    {
        pt = specFile.splitPoints[i];

        if(data.length > pt)
            substrs.push(data.substring(last, pt).trim());

        last = pt;


    }
    return substrs;



}

async function processSSV(specFile, config)
{

    var buffer = [];

    var fileStream;

    if('url' in specFile)
        fileStream = await getStreamFromFileDownload(specFile.url);
    else
        fileStream = await getStreamFromSourceFile(specFile.file);

    await new Promise(function (resolve, reject) {

        var p= fileStream.pipe(byLine.createStream());


        seach(p, (data, next)=>{
            data = data.toString('utf8');
            data = mapToSpec(splitAlongPoints(data, specFile), specFile);
            buffer.push(data);

            if(buffer.length > FLUSH_WHEN) {


                config.databaseClient.batchInsert(specFile.table, buffer).then(() => {



                    buffer.length = 0;
                    next();


                });

            }else
                next();

        },
            function(err){

                if(err)
                    reject(err);
                else
                    config.databaseClient.batchInsert(specFile.table, buffer).then(() => {



                        buffer.length = 0;
                        resolve();


                    });

            });



        p.on('error', (e)=>{

            reject(e)


        });



    });

}
async function processCSV(specFile, config)
{





    int cycles =0;
    var buffer =  [];

    var fileStream;

    if('url' in specFile)
        fileStream = await getStreamFromFileDownload(specFile.url);
    else
        fileStream = await getStreamFromSourceFile(specFile.file);

    var delimiter = config.delimiter || ','
    await new Promise(function (resolve, reject) {

        var p= fileStream.pipe(csv({delimiter:delimiter, quote:null}));

        seach(p, (data, next)=>{

            data =  mapToSpec(data, specFile);

            buffer.push(data);

            if(buffer.length > FLUSH_WHEN) {


                config.databaseClient.batchInsert(specFile.table, buffer).then(() => {

                    if(cycles++ % 20 == 0)
                        console.log("\tI'm still working...");

                    buffer.length = 0;
                    next();


                });

            }else
                next();

        },
            function(err){

                if(err)
                    reject(err);
                else
                config.databaseClient.batchInsert(specFile.table, buffer).then(() => {



                    buffer.length = 0;
                    resolve();


                });

            });



        p.on('error', (e)=>{

            reject(e)


        });




    });



}

/**
 * Downloads the file to a temp directory and streams the result
 * @param url
 * @returns {stream} - returns the temp file location
 */
async function getStreamFromFileDownload(url)
{


    var downloadedFileLoc = await downloadFileToTemp(url);

    var readStream = fs.createReadStream(downloadedFileLoc);

    if(path.extname(url) == '.gz') {



        return readStream.pipe(gzip)

    }
    else
         return readStream;

}
/**
 * Note this currently only works with the ftp urls and assumes port 21
 * @param url
 * @returns {Promise<string>} - returns the temp file location
 */
async function downloadFileToTemp(url)
{

    var parsed =  URL.parse(url);
    var config = { host: parsed.hostname,
        port: parsed.port || 21};

    var ftp = new PromiseFtp();
    await ftp.connect(config);

    var stream = await ftp.get(parsed.pathname);

    var fileName = path.basename(parsed.pathname);

    var tempDir = fs.mkdtempSync("down");
    var tempFile = path.join(tempDir, fileName);

    return new Promise(function (resolve, reject) {
        stream.once('close', resolve);
        stream.once('error', reject);
        stream.pipe(fs.createWriteStream(tempFile));
    }).then(()=>ftp.end()).then(()=> {return tempFile});



}


async function getStreamFromSourceFile(file)
{

  return fs.createReadStream(path.join(__dirname, '..', 'sources', file), 'utf8');


}

module.exports = async function(config, testMode)
{
    const sourcesPath = path.join(__dirname, '..', "sources");

   var imports =  require("fs").readdirSync(sourcesPath);


    for(var i = 0; i < imports.length; ++i)
    {
        if(testMode && i > 1)   //don't load the large file if testMode = true
            return;


        if(path.extname(imports[i]).toLowerCase() !== ".json")
        {
            continue;

        }
        var filePath = path.join(sourcesPath, imports[i]);

        var fileContents = fs.readFileSync(filePath, 'utf8');


        var jsonFile = JSON.parse(fileContents);


        var empty = await config.databaseClient.isTableEmpty(jsonFile.table);

        if(empty) {

            console.log("Loading data for table " + jsonFile.table);
            await process(jsonFile, config);
            console.log("Loaded data for table " + jsonFile.table);

        }

    }


};


