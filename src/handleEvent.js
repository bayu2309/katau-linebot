import Wrapper from './lineReplyWrapper';
import BotApi from './botApi';
import constAPI from './constants';

export default class HandleEvent {
  constructor(client) {
    this.client = client;
    this.botApi = new BotApi();

    this._handling = this._handling.bind(this);
  }

  _handling(event) {
    let client = this.client;
    let botApi = this.botApi;

    let replyToken = event.replyToken;
    let source = event.source.type;
    let reqProfile = {
      "userId": event.source.userId,
      "groupId": event.source.groupId || null,
      "roomId": event.source.roomId || null
    };

    if(event.type === "join") {
      return client.replyMessage(replyToken, Wrapper.replyText("Terima kasih telah mengundang bot ini.\n\nSilahkan ketik \"Katou keyword\" untuk melihat keyword."));
    }

    if(event.type === "message") {
      if(event.message.type !== "text") return Promise.resolve(null);

      let msgText = event.message.text.toLowerCase();

      if (msgText.includes("katou") == false) return Promise.resolve(null);

      if(msgText === "katou") {
        return client.getProfile(reqProfile.userId)
              .then(profile => client.replyMessage(replyToken, Wrapper.replyText(botApi.sendReply(profile.displayName))))
              .catch(err => client.replyMessage(replyToken, Wrapper.replyText(botApi.sendReply("Tanpa Nama"))));
      }

      if(msgText === "katou keyword") {
        return client.replyMessage(replyToken, Wrapper.replyKeyword());
      }

      if(msgText === "katou ramal") {
        return client.replyMessage(replyToken, Wrapper.replyText(botApi.getRamal()));
      }

      if(msgText.includes("katou berapa")) {
        let calcText = msgText.substr(13);

        if(calcText.length === 0) {
          return client.replyMessage(replyToken, Wrapper.replyText(`Tolong masukan angka yang ingin dihitung`));
        }

        return client.replyMessage(replyToken, Wrapper.replyText(`Hasil dari ${ calcText } : ${ eval(calcText) }`));
      }

      if(msgText.includes("katou apa itu")) {
        let keyword = msgText.substr(13);

        botApi.getWiki(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyText(result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou cari gambar")) {
        let keyword = msgText.substr(18);
        if (keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nama gambar yang ingin dicari"));

        botApi.getImgUrl(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyImg(result, result)).catch(err => {
            return client.replyMessage(replyToken, Wrapper.replyText("Gambar yang ditemukan terlalu besar untuk dimuat silahkan coba lagi."));
          });
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou ucapkan selamat ulang tahun ke")) {
        let keyword = msgText.substr(37);

        return client.replyMessage(replyToken, Wrapper.replyText(`Selamat ulang tahun ${ keyword } :D`));
      }

      if(msgText.includes("katou cuaca")) {
        let keyword = msgText.substr(12);

        botApi.getWeather(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyText(result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou cari video")) {
        let keyword = msgText.substr(17);
        if (keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nama video yang ingin dicari"));

        botApi.getVideo(keyword).then(result => {
          if(source !== 'room' && source !== 'group') return client.replyMessage(replyToken, [ Wrapper.replyText(result.title), Wrapper.replyVideo(result.videoUrl, result.thumbnail) ])

          return client.replyMessage(replyToken, [ Wrapper.replyText(`${ result.title } \n ${ result.link }`), Wrapper.replyButtonURLConfirm("Download the video", "Download", result.videoUrl) ]);
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou stalk")) {
        let keyword = msgText.substr(12);
        if (keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nama user instagram yang ingin dicari"));

        botApi.getInstagramInfo(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyInstagramProfile(result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou terjemahkan")) {
        let text = msgText.substr(24).trim();
        let lang = msgText.slice(18, 24).trim();

        if(lang.length <= 0 || text.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan kode bahasa dan teks yang ingin diterjemahkan"));

        botApi.translateText(text, lang).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyText(result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou cari lokasi")) {
        let keyword = msgText.substr(17).trim();

        if(keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan lokasi yang ingin dicari"));

        botApi.getLocation(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyLocation(keyword, result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou tulis")) {
        let keyword = msgText.substr(12);

        if(keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan teks yang ingin diubah"));

        keyword = encodeURI(keyword);
        let imgUrl = `${ constAPI.CHARTAPI_URL }${ keyword }${ constAPI.CHARTAPI_QUERY }`

        return client.replyMessage(replyToken, Wrapper.replyImg(imgUrl, imgUrl)).catch(err =>{
           return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan teks yang ingin diubah"))
        });
      }

      if(msgText === "katou 9gag") {
        botApi.get9GAG("hot").then(result => {
          return client.replyMessage(replyToken, [ Wrapper.replyText(result.memeTitle), Wrapper.replyImg(result.memeImg, result.memeImg) ]).catch(err => console.log(err));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou 9gag")) {
        let keyword = msgText.substr(11);
        keyword = keyword.replace(/\s/g, "");

        if(keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan sectionnya"));

        botApi.get9GAG(keyword).then(result => {
          return client.replyMessage(replyToken, [ Wrapper.replyText(result.memeTitle), Wrapper.replyImg(result.memeImg, result.memeImg) ]).catch(err => console.log(err));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou download musik")) {
        let keyword = msgText.substr(21).trim();

        if(keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nama musiknya"));

        botApi.getUrlYoutube(keyword).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyText(`${ result.title }\n\n Link download : ${ constAPI.MP3YOUTUBE_URL }${ result.link }`))
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if(msgText.includes("katou lovemeter")) {
        let keyword = msgText.substr(16).trim();

        if(keyword.length <= 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nama pasangannya"));

        botApi.getLoveMeter(msgText).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyText(`Persentase pasangan ${ result.fname } dan ${ result.sname } :\n\n${ result.percentage }%\n\nSaran: ${ result.result }`));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if (msgText === "katou anime quotes") {
        let quotesItem = botApi.getAnimeQuote();
        return client.replyMessage(replyToken, Wrapper.replyText(`\"${ quotesItem.quotesentence }\"\nBy : ${ quotesItem.quotecharacter }\nFrom :  ${ quotesItem.quoteanime }`));
      }

      if(msgText.includes("katou osu")) {
        if(msgText.substr(10).trim().length === 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan modenya"));
        let keyword;
        let mode;

        if(msgText.includes("osustd")) {
          keyword = msgText.substr(13).trim();

          if(keyword.length === 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nickname usernya"));
          mode = 0;
        }

        if(msgText.includes("osumania")) {
          keyword = msgText.substr(15).trim();

          if(keyword.length === 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nickname usernya"));
          mode = 3;
        }

        if(msgText.includes("osutaiko")) {
          keyword = msgText.substr(15).trim();

          if(keyword.length === 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nickname usernya"));
          mode = 1;
        }

        if(msgText.includes("osuctb")) {
          keyword = msgText.substr(13).trim();

          if(keyword.length === 0) return client.replyMessage(replyToken, Wrapper.replyText("Silahkan masukan nickname usernya"));
          mode = 2;
        }

        botApi.getOsuProfile(keyword, mode).then(result => {
          return client.replyMessage(replyToken, Wrapper.replyOsuProfile(result));
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText(err));
        });
      }

      if (msgText === "bye katou") {
        return client.replyMessage(replyToken, [ Wrapper.replyText("Bye - Bye"), Wrapper.replyImg(constAPI.KATOULEAVEIMG_URL, constAPI.KATOULEAVEIMG_URL) ]).then(result => {
          if (source === "room") {
            client.leaveRoom(reqProfile.roomId);
          } else if (source === "group") {
            client.leaveGroup(reqProfile.groupId);
          }
        }).catch(err => {
          return client.replyMessage(replyToken, Wrapper.replyText("ERROR tidak bisa keluar melalui keyword silahkan kick katou melalui setting group"));
        });
      }
    }
  }
}
