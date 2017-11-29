export default class Wrapper {
  static replyText(rtext) {
    return {
      type: "text",
      text: rtext
    };
  }

  static replyImg(originalContent, thumbnail) {
    return {
      type: "image",
      originalContentUrl: originalContent,
      previewImageUrl: thumbnail
    };
  }

  static replyVideo(videoUrl, thumbnail) {
    return {
      type: "video",
      originalContentUrl: videoUrl,
      previewImageUrl: thumbnail
    };
  }

  static replyButtonURLConfirm(buttonTitle, buttonLabel, url) {
    return {
      type: "template",
      altText: "Download Video",
      template: {
        type: "buttons",
        text: buttonTitle,
        actions: [
          {
            type: "uri",
            label: buttonLabel,
            uri: url
          }
        ]
      }
    };
  }

  static replyInstagramProfile(instagramInfo) {
    if(instagramInfo.tertutup === false) {
      return {
        "type": "template",
        "altText": "Stalk",
        "template": {
          "type": "carousel",
          "columns": [{
              "thumbnailImageUrl": instagramInfo.profile_pic,
              "title": instagramInfo.username,
              "text": instagramInfo.deskripsi_profil,
              "actions": [{
                  "type": "uri",
                  "label": "Ke Profil",
                  "uri": instagramInfo.profile_url
                },
                {
                  "type": "uri",
                  "label": "Ke Post",
                  "uri": instagramInfo.code
                },
                {
                  "type": "uri",
                  "label": "Download Gambar Post",
                  "uri": instagramInfo.src
                }
              ]
            },
            {
              "thumbnailImageUrl": instagramInfo.src,
              "title": "Postingan Terakhir",
              "text": instagramInfo.deskripsi_post,
              "actions": [{
                  "type": "uri",
                  "label": "Ke Profil",
                  "uri": instagramInfo.profile_url
                },
                {
                  "type": "uri",
                  "label": "Ke Post",
                  "uri": instagramInfo.code
                },
                {
                  "type": "uri",
                  "label": "Download Gambar Post",
                  "uri": instagramInfo.src
                }
              ]
            }
          ]
        }
      };
    } else {
      return {
        "type": "template",
        "altText": "Stalk",
        "template": {
          "type": "carousel",
          "columns": [{
            "thumbnailImageUrl": instagramInfo.profile_pic,
            "title": instagramInfo.username,
            "text": instagramInfo.objUser.deskripsi_profil,
            "actions": [{
              "type": "uri",
              "label": "Ke Profil",
              "uri": instagramInfo.profile_url
            }]
          }]
        }
      };
    }
  }

  static replyLocation(keyword, objLocation) {
    return {
      type: "location",
      title: keyword,
      address: objLocation.formatted_address,
      latitude: objLocation.latitude,
      longitude: objLocation.longitude
    }
  }

  static replyOsuProfile(objUser){
    if(objUser.withBeatmap === false) {
      return {
        "type": "template",
        "altText": "Osu Profile",
        "template": {
          "type": "carousel",
          "columns": [{
            "thumbnailImageUrl": "https://a.ppy.sh/" + objUser.user_id,
            "title": objUser.username,
            "text": objUser.deskripsi_profil,
            "actions": [{
              "type": "uri",
              "label": "Ke profile",
              "uri": "https://osu.ppy.sh/u/" + objUser.user_id
            }]
          }]
        }
      };
    } else {
      return {
        "type": "template",
        "altText": "Osu Profile",
        "template": {
          "type": "carousel",
          "columns": [{
              "thumbnailImageUrl": "https://a.ppy.sh/" + objUser.user_id,
              "title": objUser.username,
              "text": objUser.deskripsi_profil,
              "actions": [{
                  "type": "uri",
                  "label": "Ke profile",
                  "uri": "https://osu.ppy.sh/u/" + objUser.user_id
                },
                {
                  "type": "uri",
                  "label": "Ke beatmap terbaik",
                  "uri": "https://osu.ppy.sh/s/" + objUser.beatmapset_id
                }
              ]
            },
            {
              "thumbnailImageUrl": "https://b.ppy.sh/thumb/" + objUser.beatmapset_id + "l.jpg",
              "title": "Skor Terbaik",
              "text": objUser.deskripsi_best,
              "actions": [{
                  "type": "uri",
                  "label": "Ke profile",
                  "uri": "https://osu.ppy.sh/u/" + objUser.user_id
                },
                {
                  "type": "uri",
                  "label": "Ke beatmap terbaik",
                  "uri": "https://osu.ppy.sh/s/" + objUser.beatmapset_id
                }
              ]
            }
          ]
        }
      };
    }
  }

  static replyKeyword() {
    return {
      "type": "template",
      "altText": "Keyword",
      "template": {
          "type": "buttons",
          "title": "Keyword",
          "text": "List keyword",
          "actions": [
              {
                "type": "message",
                "label": "Keyword 1",
                "text": "/keyword 1"
              },
              {
                "type": "message",
                "label": "Keyword 2",
                "text": "/keyword 2"
              },
              {
                "type": "message",
                "label": "Keyword 3",
                "text": "/keyword 3"
              },
              {
                "type": "uri",
                "label": "Developer",
                "uri": "http://line.me/ti/p/~akl2340"
              }
          ]
      }
    };
  }
}
