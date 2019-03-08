const BotData = require("../../BotData.js");
const lg_var = require("../variables");
const LGGame = require("./factory");
const LgLogger = require("../logger");
const get_random_in_array = require("../../functions/parsing_functions").get_random_in_array;
const shuffle_array = require("../../functions/parsing_functions").shuffle_array;
const ReactionHandler = require("../../functions/reactionHandler").ReactionHandler;
const RichEmbed = require("discord.js").RichEmbed;
const clone = require('../../functions/clone');

class IGame {

    constructor(client) {

        this.client = client;

        return this;

    }

}

class RolesHandler extends IGame {

    constructor(client, guild, gameInfo, gameOptions) {
        super(client);

        this.gameInfo = gameInfo;
        this.gameOptions = gameOptions;

        this.guild = guild;

        this.roles = {
            JoueurLG: {
                color: 'BLUE',
                object: null
            },
            MortLG: {
                color: 'RED',
                object: null
            },
            MastermindLG: {
                color: 'WHITE',
                object: null
            }
        };

        this.factory = {
            LoupGarou: LGGame.Create.loupGarou,
            Voyante: LGGame.Create.voyante,
            Voleur: LGGame.Create.voleur,
            Chasseur: LGGame.Create.chasseur,
            Cupidon: LGGame.Create.cupidon,
            Sorciere: LGGame.Create.sorciere,
            PetiteFille: LGGame.Create.petiteFille,
            Villageois: LGGame.Create.villageois,
            Salvateur: LGGame.Create.salvateur,
            IdiotDuVillage: LGGame.Create.idiotDuVillage,
            BoucEmissaire: LGGame.Create.boucEmissaire,
            JoueurDeFlute: LGGame.Create.joueurDeFlute,
            EnfantSauvage: LGGame.Create.enfantSauvage,
            //Chevalier: LGGame.Create.chevalier,
            //Ange: LGGame.Create.ange,
            InfectPereDesLoups: LGGame.Create.infectPereDesLoups,
            Soeur: LGGame.Create.soeur,
            Renard: LGGame.Create.renard,
            //ServanteDevouee: LGGame.Create.servanteDevouee,
            Frere: LGGame.Create.frere,
            //MontreurOurs: LGGame.Create.montreurOurs,
            //Comedien: LGGame.Create.comedien,
            //AbominableSectaire: LGGame.Create.abominableSectaire,
            //ChienLoup: LGGame.Create.chienLoup,
            //VillageoisVillageois: LGGame.Create.villageoisVillageois,
            //Corbeau: LGGame.Create.corbeau,
            //GrandMechantLoup: LGGame.Create.grandMechantLoup,
            //Ancien: LGGame.Create.ancien,
            //JugeBegue: LGGame.Create.jugeBegue,
        };

        this.role_conf = [
            // Thiercelieux 0, 5
            {
                Voyante: 1,
                Chasseur: 1,
                Cupidon: 1,
                Sorciere: 1,
                PetiteFille: 1,
                Voleur: 1,
            },
            // !Thiercelieux
            // Nouvelle lune [0, 1], 2, 5
            {
                Salvateur: 1,
                IdiotDuVillage: 1,
                BoucEmissaire: 1,
                JoueurDeFlute: 1
            },
            {
                Ancien: 1,
            },
            //!Nouvelle Lune
            //Personnages
            {
                EnfantSauvage: 1,
                Chevalier: 1,
                Ange: 1,
                InfectPereDesLoups: 1,
                Soeur: 2, // todo: si une carte soeur est donnée, il faut donner la deuxième. Si impossible de donner la deuxième, donner un autre rôle.
                Renard: 1,
                ServanteDevouee: 1,
                Frere: 3, // todo: si une carte soeur est donnée, il faut donner les autres. Si impossible de les donner, donner un autre rôle.
                MontreurOurs: 1,
                Comedien: 1,
                ChienLoup: 1,
                VillageoisVillageois: 1,
                Corbeau: 1,
                GrandMechantLoup: 1,
                JugeBegue: 1,
                LoupBlanc: 1,
            },
            {
                AbominableSectaire: 1,
                Gitane: 1,
            },
            //!Personnages
            {
                Villageois: Number.MAX_SAFE_INTEGER,
            }
        ];

        if (this.gameOptions.extensions.thiercelieux) {
            this.gameType = [
                this.role_conf[0], this.role_conf[5]
            ];
        } else if (this.gameOptions.extensions.nouvelleLune) {
            this.gameType = [
                Object.assign(this.role_conf[0], this.role_conf[1]), this.role_conf[2], this.role_conf[5]
            ];
        } else if (this.gameOptions.extensions.personnage) {
            this.gameType = [
                this.role_conf[0], this.role_conf[5]
            ];
        } else {
            this.gameType = [
                this.role_conf[0], this.role_conf[5]
            ];
        }

        /**
         * @type {Array}
         */
        this.gameTypeCopy = clone(this.gameType);

        let gameTypeCopyObj;

        for (let i = 1; i < this.gameTypeCopy.length; i++) {
            gameTypeCopyObj = Object.assign(this.gameTypeCopy[0], this.gameTypeCopy[i]);
            this.gameTypeCopy[0] = gameTypeCopyObj;
        }

        try {
            delete gameTypeCopyObj.Voleur;
            delete gameTypeCopyObj.Cupidon;
            delete gameTypeCopyObj.JoueurDeFlute;
        } catch (e) {
            console.error(e);
        }

        this.gameTypeCopy = [gameTypeCopyObj];

        return this;
    }

    deleteOlderRoles() {
        return new Promise((resolve, reject) => {

            let promises = [];

            this.guild.roles.array().forEach(role => {

                Object.keys(this.roles).forEach(roleName => {
                    if (role.name === roleName) {
                        promises.push(role.delete());
                    }
                });

            });

            Promise.all(promises).then(() => resolve(true)).catch(err => reject(err));

        });
    }

    createRoles() {
        return new Promise((resolve, reject) => {

            this.deleteOlderRoles().then(() => {

                let rolePromises = [];

                Object.keys(this.roles).forEach(role_name => {

                    // creating the role 'role_name'
                    rolePromises.push(this.guild.createRole({
                        name: role_name,
                        color: this.roles[role_name].color,
                        hoist: true
                    }));

                });

                return Promise.all(rolePromises);

            }).then((roleArray) => {

                roleArray.forEach(role => {
                    this.roles[role.name].object = role;
                });

                resolve(true);

            }).catch(err => reject(err));

        });
    }

    deleteRoles() {
        return new Promise((resolve, reject) => {

            let promises = [];

            Object.keys(this.roles).forEach(roleName => {
                promises.push(this.roles[roleName].object.delete());
            });

            Promise.all(promises).then(() => resolve(true)).catch(() => resolve(true));

        });
    }

    /**
     * returns promise
     * @param guildMember
     * @returns {Promise<GuildMember>}
     */
    addPlayerRole(guildMember) {
        return guildMember.addRole(this.roles.JoueurLG.object);
    }

    addDeadRole(guildMember) {
        return guildMember.addRole(this.roles.MortLG.object);
    }

    removePlayerRole(guildMember) {
        return guildMember.removeRole(this.roles.JoueurLG.object);
    }

    removeDeadRole(guildMember) {
        return guildMember.removeRole(this.roles.MortLG.object);
    }

    /**
     * Returns no promise
     * @param guildMember
     */
    removeRoles(guildMember) {
        guildMember.removeRole(this.roles.JoueurLG.object).catch(() => true);
        guildMember.removeRole(this.roles.MortLG.object).catch(() => true);
    }

    async assignRoles(configuration) {
        let participantArray = shuffle_array(Array.from(configuration.getParticipants().keys()));

        while (participantArray.length > 0) {

            let playerId = get_random_in_array(participantArray);

            participantArray.splice(participantArray.indexOf(playerId), 1);

            if (configuration.needsLG()) {
                configuration.addPlayer(await this.assignRole(playerId, configuration, true));
            } else {
                configuration.addPlayer(await this.assignRole(playerId, configuration, false));
            }

        }

        return configuration;
    }

    getAdditionnalRoles(number) {
        return new Promise((resolve, reject) => {
            const lg_functions = require('../functions.js');

            let additionalRoles = [];

            while (number > 0 && this.confHasSpace()) {

                this.gameTypeCopy.forEach(role_block => {
                    if (!this.roleComplete(role_block)) {

                        let role_object = RolesHandler.cleanRoleArray(role_block);
                        let role_array = Object.keys(role_object);

                        additionalRoles.push(role_array[lg_functions.get_random_index(role_array)]);

                        number -= 1;
                        if (number === 0) {
                            resolve(additionalRoles);
                        }

                    }
                });

            }

            if (!this.confHasSpace()) LgLogger.warn("Conf is completely empty", this.gameInfo);

            resolve(additionalRoles);
        });
    }

    async assignRole(id, configuration, putLg) {

        if (putLg) {
            return this.factory.LoupGarou(configuration.getParticipants().get(id));
        }

        for (let i = 0; i < this.gameType.length; i++) {

            if (!this.roleComplete(this.gameType[i])) {
                return await this.setRole(configuration.getParticipants().get(id), i);
            }

        }

        throw (`No role found for ${configuration.getParticipants().get(id).displayName}`)
    }

    roleComplete(roleVar) {
        let complete = true;

        Object.keys(roleVar).forEach(role => {

            if (roleVar[role] !== 0) {
                complete = false;
            }

        });

        return complete;
    }

    setRole(guildMember, roleVarIndex) {
        return new Promise((resolve, reject) => {

            let rolesNames = Object.keys(RolesHandler.cleanRoleArray(this.gameType[roleVarIndex]));

            if (rolesNames.length === 0) {
                reject("Empty rolesNames variable");
            }

            if (!guildMember) {
                reject("GuildMember not found");
            }

            let randomRoleName = get_random_in_array(rolesNames);

            this.gameType[roleVarIndex][randomRoleName] -= 1;

            resolve(this.factory[randomRoleName](guildMember));

        });
    }

    static cleanRoleArray(roleArray) {
        let cleaned = Object();
        Object.keys(roleArray).forEach(role => {

            if (roleArray[role] !== 0)
                cleaned[role] = roleArray[role];

        });
        return cleaned;
    }

    sendRolesToPlayers(configuration) {
        return new Promise((resolve, reject) => {

            let promises = [];

            LgLogger.info(`Number of players : ${configuration.getPlayers().size}`, this.gameInfo);
            for (let player of configuration.getPlayers().values()) {
                promises.push(player.member.send(lg_var.roles_desc[player.role]));
            }

            Promise.all(promises).then((messagesSend) => {
                LgLogger.info(`Sent ${messagesSend.length} roles.`, this.gameInfo);
                resolve(true);
            }).catch(err => resolve(err)); //todo: change to reject

        });
    }

    confHasSpace() {

        let found = false;

        for (let i = 0; i < this.gameType.length; i++) {

            if (!this.roleComplete(this.gameType[i])) {
                found = true;
                break;
            }

        }

        return found;

    }
}

module.exports = {RolesHandler};
