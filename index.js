import BaseModule from './structures/BaseModule.js'
import { PermissionReminderTime } from './util/Constants.js'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'

export default class Reminder extends BaseModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(Reminder, {
            name: 'reminder',

            events: [
                {
                    mod: 'commandHandler',
                    name: 'command',
                    call: '_onCommand'
                }
            ]
        });
    }

    /**
     *
     * @param {BaseCommand} instance The command instance that is being used currently to execute the command
     * @param {Message} msgObj The Discord message object that triggered the command
     * @param {Array<string>} args Array of strings with all the arguments
     * @param {boolean} mentioned If a bot mention was used to interact with the bot
     */
    async _onCommand(instance, msgObj, args, mentioned) {
        const bot = instance.guild.me;
        const server = instance.server;

        if (bot.permissions.has(this.config.permission_bit)) return;

        const data = await server.settings.awaitData();
        if (new Date() - data?.reminders?.permissions < PermissionReminderTime) return;
        await server.settings.update({ reminders: { permissions: new Date() } });

        const actionRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Update Permissions')
                .setStyle('LINK')
                .setURL(`https://discordapp.com/oauth2/authorize?&client_id=${this._m.user.id}&scope=bot&permissions=${this.config.permission_bit}`)
        );
        const embed = new MessageEmbed()
            .setAuthor(`Permission Update Required`, instance.guild.iconURL())
            .setDescription(`${this._m.user.username} does not have all its required permissions, to make sure no problems occur in the future you can update the bot's permissions by clicking the button below.`)
            .setFooter('You may ignore this message but features may stop working in future.');

        instance.send({ embeds: [ embed ], components: [ actionRow ] });
    }
}
