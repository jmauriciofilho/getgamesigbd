const axios = require('axios')
const {Client} = require('@notionhq/client')

// ----- credenciais API IGBD -------------
const client_id = "t2ia0m1vobq1z03mj5fi15xo4kkqgl"
const client_secret = "ubjqijinyyxf279hrukk14rtliyzjd"
const grant_type = "client_credentials"
let access_token = ""
let token_type = ""
// ----------------------------------------

// ----- credenciais API notion -----------
const notion_key = "secret_8Pkgoyeu2NKu19ozxkS4NiCkRFlUSVXHDxtlbx0fUqb"
const notion_data_base_id = "87d35877b1e448d7827d903de1c19413"
const notion = new Client({
    auth: notion_key
})
// ----------------------------------------

const slug = "teenage-mutant-ninja-turtles-shredders-revenge"
let cover = ""
let game = {}

axios({
    method: "post",
    url: `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`
}).then(function(response) {

    access_token = response.data['access_token']
    token_type = response.data['token_type']
    axios({
        method: "post",
        url: "https://api.igdb.com/v4/games",
        headers: {
            'Accept': 'application/json',
            'Client-ID': client_id,
            'Authorization': `Bearer ${access_token}`
        },
        data: `fields *; where slug = "${slug}";`
    }).then( response => {
        cover = response.data[0]['cover']
        game.name = response.data[0]['name']

        axios({
            url: "https://api.igdb.com/v4/covers",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': client_id,
                'Authorization': `Bearer ${access_token}`
            },
            data: `fields *; where id = ${cover};`
        }).then(response => {
            const image_id = response.data[0]['image_id']
            game.cover = `https://images.igdb.com/igdb/image/upload/t_original/${image_id}.jpg`

            console.log(game)
            // TODO: integrar com api notion e salvar na data base notion

            notion.pages.create({
                "parent": {
                    "database_id": notion_data_base_id
                },
                "cover": {
                    "type": "external",
                    "external": {
                        "url": game.cover
                    }
                },
                "icon": {
                    "type": "emoji",
                    "emoji": "🎮"
                },
                "properties": {
                    "Nome": { 
                      "title":[
                        {
                          "text": {
                            "content": game.name
                          }
                        }
                      ]
                    },
                    "Status": {
                        "select": {
                            "name": "Vazio"
                        }
                    }
                }
            })

        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        console.error(err);
    });
}).catch(err => {
    console.error(err);
});