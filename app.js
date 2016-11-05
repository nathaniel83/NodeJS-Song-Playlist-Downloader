//modules
const ProgressBar = require('progress');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');


var searchItem,searchUrl;
var count = 0;
function readLineByLine(){
    const rl = readline.createInterface({
    input: fs.createReadStream('song.txt')
    });
    var lines = [];
    var queries = [];
    var i = 1;
    rl.on('line', (line) => {
        lines.push(line);
        // console.log(lines);
    console.log('Seach Item ' + i + ' : ', line);
    i++;
    });
    rl.on('close',function(){
        // console.log(lines);
        lines.forEach(function(element){
            queries.push("https://www.youtube.com/results?search_query="+element.replace(/ /g, "+"));
        });
        download(queries[0],queries);
    });
}

function getMusic (songUrl,songName,songList) {
    request({
            url : songUrl,
            gzip : true
        }, (err, res, body)=> {
            if(err) throw err;
            else {
                var $ = cheerio.load(body);
                var allLinks = [];
                $("#dl > .d-info > ul > li > a").each(function(){
                    allLinks.push($(this).attr('href'));
                });
                var musicUrl = allLinks[allLinks.length - 5];
                // console.log(musicUrl);
                console.log('\n'+songName);
                var req = request({
                    method: 'GET',
                    uri : musicUrl
                });
                req.pipe(fs.createWriteStream('downloads/'+ songName +'.mp3'));
                // req.pipe(out);
                req.on( 'response', function ( res ) {
                    var len = parseInt(res.headers['content-length'], 10);
                
                    // console.log();
                    var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
                        complete: '=',
                        incomplete: ' ',
                        width: 20,
                        total: len
                    });
                    
                    res.on('data', function (chunk) {
                        bar.tick(chunk.length);
                    });
                    
                    res.on('end', function () {
                        // console.log('\n');
                        if(count<songList.length){
                            count++;
                            // console.log(songList.length);
                            // console.log(count);
                            if(count<songList.length) {
                                download(songList[count],songList);  
                            } 
                        }
                    });
                });
            }
        });
}

function download(searchUrl,songList){

    request({
        url : searchUrl,
        gzip : true
    }, (err, res, body) => {
        if(err) throw err;
        else {
            var videoUrls = [];
            var $ = cheerio.load(body);
            $(".yt-lockup-title > a").each(function(){
                var urlCurrent = {
                    url : $(this).attr('href'),
                    title : $(this).attr('title')
                }
                videoUrls.push(urlCurrent);
            });
            var mainUrl = "http://keepvid.com/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D" 
                            + videoUrls[0].url.replace("/watch?v=",'');
            var songTitle = videoUrls[0].title;
            // console.log(mainUrl );
            getMusic(mainUrl,songTitle,songList);
                    

        }
    });
};

readLineByLine();