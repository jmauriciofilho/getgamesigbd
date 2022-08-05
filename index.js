const axios = require('axios')

const client_id = "t2ia0m1vobq1z03mj5fi15xo4kkqgl"
const client_secret = "ubjqijinyyxf279hrukk14rtliyzjd"
const grant_type = "client_credentials"

let access_token = ""
let token_type = ""

const slug = "final-fantasy-vii-remake"
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
        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        console.error(err);
    });
}).catch(err => {
    console.error(err);
});