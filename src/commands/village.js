let botData = require("../BotData.js");
const LoupGarou = require("../lg/game/game");
const getMusics = require('../functions/googleSheets');
const GameOptions = require("../lg/game/options").GameOptions;
const get_random_in_array = require("../functions/parsing_functions").get_random_in_array;
const SondageInfiniteChoice = require("../functions/cmds/referendum").SondageInfiniteChoice;
const RichEmbed = require('discord.js').RichEmbed;

let askMusicMode = async (message) => {

    let musicModes = await getMusics();
    let musicsData = musicModes.gameData;
    musicModes = Object.keys(musicsData);

    let embed = new RichEmbed()
        .setTitle("Cliquez ici pour rajouter vos musiques")
        .setColor(botData.BotValues.botColor)
        .setURL("https://docs.google.com/spreadsheets/d/18-N7KfwYHyRIsKG06D_5tLIrpoLaeOm9WvS_RT79wfc/edit?usp=sharing");

    let choiceArray = await new SondageInfiniteChoice(
        "Quel set de musiques voulez-vous utiliser ?",
        musicModes, message.channel, 30000, embed, true, false
    ).post();

    let result = [];

    choiceArray.forEach(choice => {
        result.push(musicModes[choice[0] - 1]);
    });

    let finalChoice = null;

    if (result.length === 0) {
        finalChoice = get_random_in_array(musicModes);
    } else {
        finalChoice = get_random_in_array(result);
    }

    return musicsData[finalChoice];
};

let askOptions = async (message) => {

    let gameOptions = new GameOptions().activateVillageExtension();

    gameOptions.musicMode = await askMusicMode(message);

    await message.channel.send(new RichEmbed().setColor(botData.BotValues.botColor)
        .setTitle(`Musiques utilisées : ${gameOptions.musicMode.name}`));

    return gameOptions;

};

let launchNewGame = async (LGBot, message, LG) => {

    let gameOptions = await askOptions(message);

    LG.running = true;
    LG.stemming = message.author.id;
    LGBot.LG.set(message.guild.id, LG);

    LG.game = new LoupGarou.Game(LGBot, message, gameOptions);

    await LG.game.launch();

    LG.game = null;
    LG.running = false;
    LGBot.LG.set(message.guild.id, LG);

};

module.exports = {
    name: __filename.split('/').pop().split('.').shift(),
    description: 'Lancer une nouvelle partie de Loup Garou avec l\'extension Le Village',
    execute(LGBot, message) {

        if (!message.member) {
            return;
        }

        message.reply("L'extension Le Village est en cours de développement").catch(console.error);
    },
};

