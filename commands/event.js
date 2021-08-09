const {MessageEmbed} = require('discord.js');
const {getTimeFuture} = require('../util/date');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = async (interaction) => {
    await interaction.deferReply({ephemeral: true});

    const stepValues = [];
    const steps = [
        new MessageEmbed()
            .setColor('#cd1c1c')
            .setTitle('Enter the event name')
            .setFooter('To exit, type \'cancel\'', 'https://thefighting36th.com/img/favicon-16x16.png'),
        new MessageEmbed()
            .setColor('#cd1c1c')
            .setTitle('Enter the event description')
            .setDescription('This is where you will put the entire body of the event content. \n\n Type `None` for no description.')
            .setFooter('To exit, type \'cancel\'', 'https://thefighting36th.com/img/favicon-16x16.png'),
        new MessageEmbed()
            .setColor('#cd1c1c')
            .setTitle('When does the event start?')
            .setDescription('> YYYY-MM-DD 8:00 PM')
            .setFooter('To exit, type \'cancel\'', 'https://thefighting36th.com/img/favicon-16x16.png'),
        new MessageEmbed()
            .setColor('#cd1c1c')
            .setTitle('What is the duration of the event?')
            .setDescription('Type `None` for no duration. \n\n > 2h \n > 45m \n > 1h30m')
            .setFooter('To exit, type \'cancel\'', 'https://thefighting36th.com/img/favicon-16x16.png')
    ];

    let currentStep = 0;
    const dmChannel = await interaction.user.createDM();

    const messageCollector = dmChannel.createMessageCollector({
        idle  : 60 * 2 * 1000,
        filter: (message) => (message.author.id === interaction.user.id)
    });

    messageCollector.on('collect', (message) => {
        if (message.content.toLowerCase() === 'cancel') {
            messageCollector.stop('cancel');
        } else {
            let validInput = true;

            switch (currentStep) {
                // title
                case 0: {
                    stepValues.push(message.content);
                    break;
                }

                // description
                case 1: {
                    stepValues.push(message.content);
                    break;
                }

                // start time
                case 2: {
                    const date = dayjs(message.content);

                    if (!date.isValid()) {
                        dmChannel.send('Invalid start time. Try again.');
                        validInput = false;
                    } else {
                        stepValues.push(message.content);
                    }

                    break;
                }

                // duration
                case 3: {
                    const startDate = dayjs(stepValues[currentStep - 1]).tz('America/New_York', true);
                    const endDate = getTimeFuture(message.content, startDate);

                    if (!endDate.isValid()) {
                        dmChannel.send('Invalid duration. Try again.');
                        validInput = false;
                    } else {
                        stepValues.push(message.content);
                    }
                }
            }

            // either move to next step or finish
            if (validInput) {
                if (++currentStep === steps.length) {
                    messageCollector.stop('complete');
                } else {
                    dmChannel.send({embeds: [steps[currentStep]]});
                }
            }
        }
    });

    messageCollector.on('end', (collected, reason) => {
        if (reason === 'cancel') {
            dmChannel.send('Event creation has been cancelled.');
            interaction.editReply('Event creation has been cancelled.');
        } else if (reason === 'idle') {
            dmChannel.send('I\'m not sure where you went. We can try this again later.');
        } else if (reason === 'complete') {
            sendEvent(interaction.channel, stepValues, interaction.member)
                .then((message) => {
                    dmChannel.send({embeds: [
                        new MessageEmbed()
                            .setColor('#cd1c1c')
                            .setTitle('Event has been created!')
                            .setDescription(`[click here to view the event](${message.url})`)
                            .setTimestamp()
                            .setFooter('', 'https://thefighting36th.com/img/favicon-16x16.png')
                    ]
                    })
                        .then(() => interaction.editReply('Event has been created!'));
                });
        }
    });

    await dmChannel.send({embeds: [steps[currentStep]]});

    return interaction.editReply('Check your dm.');
};

async function sendEvent (channel, values, creator) {
    const start = dayjs(values[2]).tz('America/New_York', true);
    const end = getTimeFuture(values[3], start);

    return channel.send({
        embeds: [
            new MessageEmbed()
                .setColor('#cd1c1c')
                .setTitle(values[0])
                .setDescription(values[1] + '\n')
                .addFields(
                    {
                        name : 'Time',
                        value: `${start.format('dddd, MMM D YYYY h:mm a')} - ${end.format('dddd, MMM D YYYY h:mm a')} (EST)`
                    },
                    {
                        name  : '✅ Attending',
                        value : '-',
                        inline: true
                    },
                    {
                        name  : '❓ Tentative',
                        value : '-',
                        inline: true
                    },
                    {
                        name  : '❌ Declined',
                        value : '-',
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter(`Created by ${creator.displayName}`, 'https://thefighting36th.com/img/favicon-16x16.png')
        ]
    });
}