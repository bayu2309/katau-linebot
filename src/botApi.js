import rp from 'request-promise';
import gis from 'g-i-s';
import youtubeSearch from 'youtube-search';
import ytdlCore from 'ytdl-core';
import cheerio from 'cheerio';
import animequote from 'animequote';
import * as osu from 'osu';
import puppeteer from 'puppeteer';

import constAPI from './constants';

export default function BotApi() {
  this.sendReply = function(username) {
    let replyString = [
      "Iya, " + username + " ?",
      "Ada apa " + username + " ?",
      "Ada yang bisa dibantu " + username + " ?"
    ];

    let indexRand = Math.floor(Math.random() * replyString.length);

    return replyString[indexRand];
  }

  this.getRamal = function() {
    let ramalan = [
      "Berhati-hatilah hari ini adalah hari tersial mu",
      "Hari ini mungkin agak menyusahkan bagimu jadi berhati-hatilah",
      "Hari ini mungkin kamu akan menemukan jodohmu",
      "Hari ini mungkin akan sangat menguntungkan bagi keuanganmu",
      "Tiada hari yang lebih baik dari hari ini bagimu"
    ];

    let indexRand = Math.floor(Math.random() * ramalan.length);

    return ramalan[indexRand];
  }

  this.getWiki = function(keyword) {
    return new Promise((resolve, reject) => {
      let keywordEncoded = encodeURI(keyword);

      let options = {
        uri: constAPI.WIKIPEDIA_URL + keywordEncoded,
        json: true
      }
      rp(options).then(response => {
        let pages = response.query.pages;
        let url = `https://id.wikipedia.org/wiki/${ keywordEncoded }`

        for(let i in pages) {
          let extract = pages[i].extract;

          if (extract == "") {
            resolve("Link dialihkan ke " + url);
          } else if (extract == null) {
            resolve("Tidak ditemukan hasil dengan keyword : " + keyword);
          } else if (extract != null) {
            if (extract.length > 1900) {
              extract = extract.substr(0, 1900) + "...";
            }

            resolve(extract + " Read More: " + url);
          }
        }
      }).catch(e => {
        reject("Request gagal atau halaman wikipedia tidak ditemukan");
      });
    });
  }

  this.getImgUrl = function(keyword) {
    return new Promise((resolve, reject) => {
      let options = {
        searchTerm: keyword,
        queryStringAddition: '&safe=active&tbs=isz:m'
      }

      gis(options, (err, result) => {
        if(err) reject(`Gambar ${ keyword } tidak ditemukan`);
        let randomUrl = Math.round(Math.random() * result.length);

        (result[randomUrl] === undefined) ? reject(`Gambar ${ keyword } tidak ditemukan`) : resolve(result[randomUrl].url);
      });
    });
  }

  this.getWeather = function(keyword) {
    return new Promise((resolve, reject) => {
      let url = `${ constAPI.OPENWEATHERMAP_URL }${ keyword }${ constAPI.OPENWEATHERMAP_QUERY }${ constAPI.OPENWEATHERMAP_APPID }`;

      let options = {
        uri: url,
        json: true
      }

      rp(options).then(response => {
        let resultData = {
          cityName: response.name,
          degree: `${ response.main.temp } C`,
          humidity: `${ response.main.humidity }%`,
          pressure: `${ response.main.pressure } HPa`,
          windSpeed: `${ response.wind.speed } m/s`
        };

        let cuaca = `Cuaca di kota ${ resultData.cityName } : \n Suhu : ${ resultData.degree } \n Kelembaban : ${ resultData.humidity } \n Tekanan Udara : ${ resultData.pressure } \n Kecepatan Angin : ${ resultData.windSpeed } `

        resolve(cuaca);
      }).catch(err => {
        reject("Request gagal atau kota tidak ditemukan");
      })
    });
  }

  this.getVideo = function(keyword) {
    return new Promise((resolve, reject) => {
      let options = {
        maxResults: 5,
        order: "relevance",
        type: "video",
        safeSearch: "strict",
        key: constAPI.GOOGLECLOUDAPI_KEY
      };

      youtubeSearch(keyword, options, (err ,result) => {
        if (err || result == undefined || result == [] || result.length <= 0) {
          reject("Video tidak ditemukan atau LIMIT");
        } else {
          let randomIndex = Math.round(Math.random() * result.length);
          let resultVideo = {
            link: result[randomIndex].link,
            title: result[randomIndex].title,
            thumbnail: result[randomIndex].thumbnails.default.url
          }

          console.log(resultVideo.link);
          ytdlCore.getInfo(resultVideo.link, {}, (err, info) => {
            console.log(info);
            if (err){
              resultVideo.videoUrl = "undefined"; 
              resolve(resultVideo);
            } else if (info == undefined) { 
              resultVideo.videoUrl = "undefined"; 
              resolve(resultVideo);
            } else {
              for(let i = 0; i < info.formats.length; i++){
                if(info.formats[i].container === "mp4") {
                  resultVideo.videoUrl = info.formats[i].url;

                  resolve(resultVideo);
                  break;
                }
              }
            }
          });
        }
      });
    });
  }

  this.getInstagramInfo = function(keyword) {
    return new Promise((resolve, reject) => {
      puppeteer.launch()
        .then(browser => browser)
        .then(browser => browser.newPage())
        .then(page => { 
          Promise.all([
            page.goto(`${ constAPI.INSTAGRAM_URL }${ keyword }`),
          ]).then(() => {
            page.content().then(html => {
              const $ = cheerio.load(html);
              let username = $('._ienqf').children().first().text();
              let followersCount = $('._fd86t').eq(0).text();
              let followingCount = $('._fd86t').eq(1).text();
              let profile_pic = $('._rewi8').attr('src');
              if(profile_pic === undefined) reject('Tidak menemukan user instagram dengan id : ' + keyword);
              let profile_url = "https://www.instagram.com/" + username;
              let post = $('._2di5p').eq(0).attr('src');
              let is_private = (!post) ? true : false;
              
              let mouse = page.mouse;

              let count = $('._2di5p').length;
              
              let deskripsi_profil = "Following : " + followingCount + "\nFollowers : " + followersCount;
              
              let instagramInfo = { username, profile_pic, profile_url, deskripsi_profil }

              if (count != 0 && is_private != true) {
                    instagramInfo.tertutup = false;

                    page.click('._cqw45 span').then(() => {
                      Promise.all([
                        page.hover('._mck9w, ._gvoze, ._tn0ps'),
                        mouse.move(1,1)
                      ]).then(() => {
                        page.content().then(html2 => {
                          const $2 = cheerio.load(html2);
    
                          let src = post;
                          let code = "https://www.instagram.com" + $('._e3il2').eq(0).parent().attr('href');
                          let commentCount = $2('._mli86').children().children().eq(1).children().eq(0).text();
                          let likeCount = $2('._mli86').children().children().eq(0).children().eq(0).text();
                          let deskripsi_post = "Likes : " + likeCount + "\nComments : " + commentCount;
    
                          instagramInfo.src = src;
                          instagramInfo.deskripsi_post = deskripsi_post;
                          instagramInfo.code = code;
                          
                          resolve(instagramInfo);
                        }).catch(e => console.log(e));
                      }).catch(e => reject('Error: Silahkan coba lagi'));
                    }).catch(e => { 
                      Promise.all([
                        page.hover('._mck9w, ._gvoze, ._tn0ps'),
                        mouse.move(1, 1)
                      ]).then(() => {
                        page.content().then(html2 => {
                          const $2 = cheerio.load(html2);
    
                          let src = post;
                          let code = "https://www.instagram.com" + $('._e3il2').eq(0).parent().attr('href');
                          let commentCount = $2('._mli86').children().children().eq(1).children().eq(0).text();
                          let likeCount = $2('._mli86').children().children().eq(0).children().eq(0).text();
                          let deskripsi_post = "Likes : " + likeCount + "\nComments : " + commentCount;
    
                          instagramInfo.src = src;
                          instagramInfo.deskripsi_post = deskripsi_post;
                          instagramInfo.code = code;
                          
                          resolve(instagramInfo);
                        }).catch(e => console.log(e));
                      }).catch(e => console.log(e));
                    }).catch(e => console.log(e));
              } else {
                instagramInfo.tertutup = true;
                resolve(instagramInfo);
              }
            }).catch(e => console.log(e));
          }).catch(e => console.log(e)); 
        }).catch(e => console.log(e));
    });
  }

  this.translateText = function(text, lang) {
    return new Promise((resolve, reject) => {
      let options = {
        uri: `${ constAPI.YANDEXTRANSLATE_URL }${ constAPI.YANDEXTRANSLATE_KEY }${ constAPI.YANDEXTEXT_QUERY }${ text }${ constAPI.YANDEXLANG_QUERY }${ lang }${ constAPI.YANDEX_OTHERQUERY }`
      }

      rp(options).then(result => {
        const $ = cheerio.load(result);

        resolve("Hasil terjemahan :\n\n"+ $("Translation text").text() + "\n\nPowered by Yandex.Translate");
      }).catch(err => {
        reject("Request gagal atau kode bahasa tidak ditemukan");
      })
    });
  }

  this.getLocation = function(keyword) {
    return new Promise((resolve, reject) => {
      keyword = encodeURI(keyword);

      let options ={
        uri: `${ constAPI.GMAPSJS_URL }${ keyword }${ constAPI.GMAPSJS_QUERY }${ constAPI.GMAPSJS_KEY }`,
        json: true
      }

      rp(options).then(result => {
        if(result.status == "ZERO_RESULTS") reject("Tidak dapat menemukan lokasi");

        let formatted_address = result.results[0].formatted_address;
        let latitude = result.results[0].geometry.location.lat;
        let longitude = result.results[0].geometry.location.lng;

        if (formatted_address.length > 100) {
          formatted_address = formatted_address.substr(0, 90) + '...';
        }

        resolve({ formatted_address, latitude, longitude });
      }).catch(err => {
        reject("Request gagal atau tidak dapat menemukan lokasi");
      });
    });
  }

// No longer working !
//   this.get9GAG = function(keyword) {
//     return new Promise((resolve, reject) => {
//       let options = {
//         uri: `${ constAPI.$9GAG_URL }${ keyword }`
//       }

//       rp(options).then(result => {
//         const $ = cheerio.load(result);
//         let badgeImg = $(".badge-item-img");
//         let item = [];

//         for(let i = 0; i < badgeImg.length; i++) {
//           item.push({
//             memeTitle: badgeImg.eq(i).attr("alt"),
//             memeImg: badgeImg.eq(i).attr("src")
//           });
//         }

//         let randIndex = Math.round(Math.random() * item.length);

//         resolve(item[randIndex]);
//       }).catch(err => {
//         reject(`Request gagal atau section ${ keyword } tidak ditemukan`);
//       })
//     });
//   }

  this.getUrlYoutube = function(keyword) {
    return new Promise((resolve, reject) => {
      let options = {
        maxResults: 5,
        order: "relevance",
        type: "video",
        safeSearch: "strict",
        key: constAPI.GOOGLECLOUDAPI_KEY
      };

      youtubeSearch(keyword, options, (err, result) => {
        if (err || result == undefined || result == [] || result.length <= 0) {
          reject("Video tidak ditemukan atau LIMIT");
        } else {
          let resultVideo = {
            link: result[0].link,
            title: result[0].title,
          }

          resolve(resultVideo);
        }
      });
    });
  }

  function getCoupleName(keyword) {
    let signPosition = keyword.indexOf(":");
    let person1 = keyword.substr(16, signPosition - 16);
    let person2 = keyword.substr(signPosition + 1);
    return {
      personName1: person1,
      personName2: person2
    };
  }

  this.getLoveMeter = function(keyword) {
    return new Promise((resolve, reject) => {
      let person = getCoupleName(keyword);

      let options = {
        uri: `${ constAPI.MASHAPE_LOVEMETERURL }${ person.personName1 }${ constAPI.MASHAPE_LOVEMETERQUERY }${ person.personName2 }`,
        json: true,
        headers: {
          "X-Mashape-Key": `${ constAPI.MASHAPE_APPKEY }`,
          "Accept": "application/json"
        }
      };

      rp(options).then(result => {
        resolve(result);
      }).catch(err => {
       
        reject("Request gagal atau tidak dapat menghitung persentase pasangan");
      });
    });
  }

  this.getAnimeQuote = function(keyword) {
    let quoteItem = animequote();

    return quoteItem;
  }

  this.getOsuProfile = function(keyword, mode) {
    return new Promise((resolve, reject) => {
      const osuApi = osu.api(constAPI.OSUAPI_KEY);

      let resultProfile;
      let resultBest;
      let deskripsi_profil;
      let deskripsi_best;

      osuApi.getUser({ u: keyword, m: mode }).then(resultProfiles => {
        resultProfile = resultProfiles;

        return osuApi.getUserBest({ u: keyword, m: mode, limit: 1 });
      }).then(resultBests => {
        resultBest = resultBests;

        deskripsi_profil = "Level : " + Math.floor(parseInt(resultProfile[0].level)) + "    Acc : " + Math.floor(parseInt(resultProfile[0].accuracy)) + "%\nRank : " + resultProfile[0].pp_rank + "\nPP :" + resultProfile[0].pp_raw;

        if (resultBest[0].length === 0) {
          resolve({
            withBeatmap: false,
            userId: resultProfile[0].user_id,
            username: resultProfile[0].username,
            deskripsi_profil,
          });
        }

        return osuApi.getBeatmaps({b: resultBest[0].beatmap_id, limit: 1});
      }).then(resultBeatmap => {
        let beatmapTitle = resultBeatmap[0].title;

        if (beatmapTitle.length > 26) {
          beatmapTitle = beatmapTitle.substr(0, 26) + "...";
        }

        deskripsi_best = beatmapTitle + "\nScore : " + resultBest[0].score + "\nPP : " + Math.floor(parseInt(resultBest[0].pp));
        resolve({
          withBeatmap: true,
          user_id: resultProfile[0].user_id,
          username: resultProfile[0].username,
          deskripsi_profil,
          beatmapset_id: resultBeatmap[0].beatmapset_id,
          deskripsi_best
        });
      }).catch(err => {
        reject("Request gagal atau tidak dapat menemukan user osu!");
      });
    });
  }
}

// let botApp = new BotApi();

// botApp.getInstagramInfo('_rehre').then(res => console.log(res)).catch(e => console.log(e));
