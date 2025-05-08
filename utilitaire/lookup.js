const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const db = require("quick.db");
const config = require("../config");

const colorDB = new db.table("Color");
const perm1DB = new db.table("Perm1");
const perm2DB = new db.table("Perm2");
const perm3DB = new db.table("Perm3");
const ownerDB = new db.table("Owner");

module.exports = {
    name: 'lookup',
    usage: 'lookup [@utilisateur]',
    async execute(client, message, args) {
        const color = colorDB.get(`color_${message.guild.id}`) || config.bot.couleur;

        const perm1 = perm1DB.get(`${message.guild.id}`);
        const perm2 = perm2DB.get(`${message.guild.id}`);
        const perm3 = perm3DB.get(`${message.guild.id}`);

        const isOwner = ownerDB.get(`owners.${message.author.id}`);
        const isBuyer = config.bot.buyer.includes(message.author.id);
        const hasPermission = message.member.roles.cache.has(perm1) || message.member.roles.cache.has(perm2) || message.member.roles.cache.has(perm3);

        if (!isOwner && !hasPermission && !isBuyer) {
            return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
        }

        const target = message.mentions.members.first() || message.member;

        const permissionLabels = {
            ADMINISTRATOR: "Administrateur",
            MANAGE_GUILD: "Gérer le serveur",
            MANAGE_ROLES: "Gérer les rôles",
            MANAGE_CHANNELS: "Gérer les salons",
            KICK_MEMBERS: "Expulser des membres",
            BAN_MEMBERS: "Bannir des membres",
            MANAGE_NICKNAMES: "Gérer les surnoms",
            MANAGE_EMOJIS_AND_STICKERS: "Gérer les émojis",
            MANAGE_WEBHOOKS: "Gérer les webhooks",
            MANAGE_MESSAGES: "Gérer les messages",
            MENTION_EVERYONE: "Mentionner everyone"
        };

        const badgeLabels = {
            DISCORD_EMPLOYEE: "Employé Discord",
            DISCORD_PARTNER: "Partenaire Discord",
            BUGHUNTER_LEVEL_1: "Bug Hunter Niveau 1",
            BUGHUNTER_LEVEL_2: "Bug Hunter Niveau 2",
            HYPESQUAD_EVENTS: "HypeSquad Events",
            HOUSE_BRILLIANCE: "Maison Brillance",
            HOUSE_BRAVERY: "Maison Bravoure",
            HOUSE_BALANCE: "Maison Équilibre",
            EARLY_SUPPORTER: "Supporter précoce",
            TEAM_USER: "Utilisateur d'équipe",
            VERIFIED_BOT: "Bot vérifié",
            EARLY_VERIFIED_DEVELOPER: "Développeur vérifié"
        };

        const avatarURL = target.user.displayAvatarURL({ dynamic: true });
        const nickname = target.nickname || "Aucun";
        const roles = target.roles.cache.filter(role => role.id !== message.guild.id).map(role => role.name).join(", ") || "Aucun";
        const accountCreated = moment(target.user.createdAt).format("DD/MM/YYYY HH:mm:ss");
        const joinedAt = moment(target.joinedAt).format("DD/MM/YYYY HH:mm:ss");

        const userPermissions = target.permissions.toArray().map(p => permissionLabels[p]).filter(Boolean).join(", ") || "Aucune";
        const userBadges = target.user.flags?.toArray().map(flag => badgeLabels[flag]).filter(Boolean).join(", ") || "Aucun";
        const isBot = target.user.bot ? "Oui" : "Non";

        const embed = new MessageEmbed()
            .setAuthor({ name: "Informations de l'utilisateur", iconURL: avatarURL })
            .setThumbnail(avatarURL)
            .addFields(
                { name: "Identité", value: `Nom : ${target.user.username}\nSurnom : ${nickname}` },
                { name: "Compte", value: `Badges : ${userBadges}\nBot : ${isBot}` },
                { name: "Serveur", value: `Rôles : ${roles}\nPermissions : ${userPermissions}` },
                { name: "Dates", value: `Création du compte : ${accountCreated}\nArrivée sur le serveur : ${joinedAt}` }
            )
            .setFooter({ text: `ID utilisateur : ${target.user.id}`, iconURL: avatarURL })
            .setColor(color);

        message.channel.send({ embeds: [embed] });
    }
};
