module.exports = {
    name: __filename.split('/').pop().split('.').shift(),
    description: 'Lancer une nouvelle partie de Loup Garou avec l\'extension Personnages',
    execute(LGBot, message) {

        if (!message.member) {
            return;
        }

        message.reply("L'extension Personnages est en cours de développement").catch(console.error);

    },
};

