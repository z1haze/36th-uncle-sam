/* global window, document, Image */

const {JSDOM} = require('jsdom');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = (interaction) => {
    const channel = interaction.guild.channels.cache.get(process.env.PLAYER_STATS_OUTPUT_CHANNEL_ID);

    if (!channel) {
        return interaction.reply({
            content  : 'Stats output channel does not exist!',
            ephemeral: true
        });
    }

    const game = interaction.options.get('game').value;
    const platform = interaction.options.get('platform').value;
    const player = interaction.options.get('gamertag').value.toLowerCase();
    const statsUrl = `https://battlefieldtracker.com/${game}/profile/${platform}/${player}/overview`;

    return interaction.deferReply()
        .then(async () => {
            let dom;

            try {
                dom = await JSDOM.fromURL(statsUrl, {runScripts: 'dangerously'});
            } catch (e) {
                if (e.response.statusCode === 404) {
                    return interaction.editReply(`Player "${player}" found. Check your spelling and try again.`);
                } else {
                    return interaction.editReply('Stats bot broke, tell wiggls!');
                }
            }

            // the javascript window that exists when the page first loads
            const state = dom.window.__INITIAL_STATE__;

            switch (game) {
                case 'bfv': {
                    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
                    const page = await browser.newPage();

                    await page.goto('http://stats.thefighting36th.com/');

                    // get size of div for screenshot
                    const dimensions = await page.evaluate(() => {
                        const el = document.getElementById('wrapper');

                        return {
                            width            : el.offsetWidth,
                            height           : el.offsetHeight,
                            deviceScaleFactor: window.devicePixelRatio
                        };
                    });

                    await page.setViewport({
                        width : dimensions.width,
                        height: dimensions.height
                    });

                    // extract the data that we need
                    const stats = state.stats;

                    // do the hackery
                    await page.evaluate((stats, game, username, platform) => new Promise((resolve) => {
                        const x = stats.standardProfiles[`${game}|${platform}|${username}`];
                        const s = x.segments.find((segment) => segment.type === 'overview').stats;
                        const c = x.segments.filter((segment) => segment.type === 'class');
                        const a = x.platformInfo;

                        const promises = [];

                        // kills
                        document.getElementById('kills').innerText = s.kills.metadata.displayValue;
                        document.getElementById('kills-percentile').innerText = `Top ${100 - s.kills.percentile}%`;

                        // deaths
                        document.getElementById('deaths').innerText = s.deaths.metadata.displayValue;
                        document.getElementById('deaths-percentile').innerText = `Top ${100 - s.deaths.percentile}%`;

                        // accuracy
                        document.getElementById('accuracy').innerText = s.shotsAccuracy.metadata.displayValue;
                        document.getElementById('accuracy-percentile').innerText = `Top ${100 - s.shotsAccuracy.percentile}%`;

                        // kill streak
                        document.getElementById('kill-streak').innerText = s.killStreak.metadata.displayValue;
                        document.getElementById('kill-streak-percentile').innerText = `Top ${100 - s.killStreak.percentile}%`;

                        // top class
                        const topClass = c.sort((c1, c2) => c2.stats.score.value - c1.stats.score.value)[0];
                        document.getElementById('top-class').innerText = topClass.metadata.name;

                        // top class image
                        promises.push(new Promise((resolve) => {
                            const image = new Image();
                            image.onload = resolve;
                            image.onerror = resolve;
                            image.src = encodeURI(topClass.metadata.imageUrl);

                            document.getElementById('top-class-img').setAttribute('src', image.src);
                        }));

                        // gamer tag
                        document.getElementById('name').innerText = a.platformUserHandle;

                        // time played
                        document.getElementById('time-played').innerText = s.timePlayed.displayValue;

                        // score per minute
                        document.getElementById('score-min').innerText = s.scorePerMinute.displayValue;
                        document.getElementById('score-min-percentile').innerText = `Top ${100 - s.scorePerMinute.percentile}%`;

                        // k/d
                        document.getElementById('kd').innerText = s.kdRatio.displayValue;
                        document.getElementById('kd-percentile').innerText = `Top ${100 - s.kdRatio.percentile}%`;

                        // win %
                        document.getElementById('win').innerText = s.wlPercentage.displayValue;
                        document.getElementById('win-percentile').innerText = `Top ${100 - s.wlPercentage.percentile}%`;

                        // level
                        document.getElementById('level').innerText = s.rank.displayValue;
                        document.getElementById('rank').innerText = s.rank.metadata.label;

                        // avatar
                        promises.push(new Promise((resolve) => {
                            const image = new Image();
                            image.onload = resolve;
                            image.onerror = resolve;
                            image.src = encodeURI(a.avatarUrl);

                            document.getElementById('avatar').style.backgroundImage = `url('${image.src}')`;
                        }));

                        //rank
                        promises.push(new Promise((resolve) => {
                            const image = new Image();
                            image.onload = resolve;
                            image.onerror = resolve;
                            image.src = encodeURI(s.rank.metadata.imageUrl);

                            document.getElementById('rank-img').style.backgroundImage = `url('${image.src}')`;
                        }));

                        return Promise.all(promises)
                            .then(() => resolve(undefined));
                    }), stats, game, player, platform);

                    const id = uuidv4();
                    const filePath = path.resolve('stats', `${id}.png`);

                    await page.screenshot({path: filePath});
                    await browser.close();

                    const {MessageAttachment} = require('discord.js');
                    const image = fs.readFileSync(filePath);
                    const attachment = new MessageAttachment(image);

                    const encodedUrl = encodeURI(`${statsUrl}?ref=discord`);

                    fs.unlinkSync(filePath);

                    return {
                        content: `**For all stats, visit: <${encodedUrl}>**`,
                        files  : [attachment]
                    };
                }

                default:
                    return {
                        content: 'Invalid game selection.'
                    };
            }
        })
        .catch((e) => {
            return {
                content: `An uncaught error occurred: ${e.message}`
            };
        })
        .then((opts) => {
            return interaction.editReply(opts);
        });

};