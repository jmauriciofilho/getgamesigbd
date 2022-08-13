const axios = require('axios')
const {Client} = require('@notionhq/client')
const jsonData = require('./games.json')

const httpRequest = async (url, method, headers, data) => {
    const response = await axios({
        url: url,
        method: method,
        headers: headers,
        data: data
    })

    return response
}

const authAPiIgdb = async (url, method, headers, data) => {
    const authResponse = await httpRequest(url, method, headers, data)
    const authCredentials = {
        'access_token': authResponse.data['access_token'],
        'token_type': authResponse.data['token_type']
    }
    return authCredentials
}

const getGameBySlug = async (url, method, headers, data) => {
    const responseGame = await httpRequest(url, method, headers, data)
    const game = {
        'name': responseGame.data[0]['name'],
        'coverId': responseGame.data[0]['cover']
    }
    return game
}

const getCoverById = async (url, method, headers, data) => {
    const responseGame = await httpRequest(url, method, headers, data)
    const image_id = responseGame.data[0]['image_id']
    const cover = `https://images.igdb.com/igdb/image/upload/t_original/${image_id}.jpg`
    return cover
}

const savePageNotion = async (notion, notion_data_base_id, gameCover, gameName) => {
    notion.pages.create({
        "parent": {
            "database_id": notion_data_base_id
        },
        "cover": {
            "type": "external",
            "external": {
                "url": gameCover
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
                    "content": gameName
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
}

const main = async () => {
    // ----- credenciais API IGBD -------------
    const client_id = "t2ia0m1vobq1z03mj5fi15xo4kkqgl"
    const client_secret = "ubjqijinyyxf279hrukk14rtliyzjd"
    const grant_type = "client_credentials"
    // ----------------------------------------

    // ----- credenciais API notion -----------
    const notion_key = "secret_8Pkgoyeu2NKu19ozxkS4NiCkRFlUSVXHDxtlbx0fUqb"
    const notion_data_base_id = "87d35877b1e448d7827d903de1c19413"
    const notion = new Client({
        auth: notion_key
    })
    // ----------------------------------------

    try{
        const authCredentials = await authAPiIgdb(
            `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`, 
            "post", 
            {}, 
            ""
        )
    
        Object.keys(jsonData).forEach(async function(key, value){
            let slug = jsonData[key]
            const game = await getGameBySlug(
                "https://api.igdb.com/v4/games", 
                "post", 
                {
                    'Accept': 'application/json',
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${authCredentials['access_token']}`
                },
                `fields *; where slug = "${slug}";`
            )
        
            const cover = await getCoverById(
                "https://api.igdb.com/v4/covers",
                "post",
                {
                    'Accept': 'application/json',
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${authCredentials['access_token']}`
                },
                `fields *; where id = ${game["coverId"]};`
            )
        
            await savePageNotion(notion, notion_data_base_id, cover, game["name"])
    
            console.log(`Game salvo: ${game.name}`)
        })
    }catch(err){
        console.log(err)
    }
    
}

main()