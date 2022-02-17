/* global window, document, Image */

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

    return interaction.deferReply()
        .then(async () => {
            switch (game) {
                case 'bfv': {
                    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
                    const page = await browser.newPage();

                    // establish a session to we can query the api
                    const profileUrl = `https://battlefieldtracker.com/${game}/profile/${platform}/${player}/overview`;
                    await page.goto(profileUrl);

                    // query the api
                    const statsUrl = `https://api.tracker.gg/api/v2/${game}/standard/profile/${platform}/${player}`;
                    const response = await page.goto(statsUrl);
                    await page.content();

                    if (response.status() === 404) {
                        return `Player "${player}" not found. Check your spelling and try again.`;
                    } else if (response.status() !== 200) {
                        return 'Stats bot broke, tell wiggls!';
                    }

                    const state = await page.evaluate(() => JSON.parse(document.body.innerText));

                    await page.goto('http://stats.thefighting36th.com/', {waitUntil : 'networkidle0'});
                    await page.content();

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
                    const stats = state.data;

                    // do the hackery
                    await page.evaluate((stats, game, username, platform) => new Promise((resolve) => {
                        const s = stats.segments.find((segment) => segment.type === 'overview').stats;
                        const c = stats.segments.filter((segment) => segment.type === 'class');
                        const a = stats.platformInfo;

                        const promises = [];

                        // kills
                        document.getElementById('kills').innerText = s.kills.displayValue;
                        document.getElementById('kills-percentile').innerText = `Top ${(100 - s.kills.percentile).toFixed(0)}%`;

                        // deaths
                        document.getElementById('deaths').innerText = s.deaths.displayValue;
                        document.getElementById('deaths-percentile').innerText = `Top ${(100 - s.deaths.percentile).toFixed(0)}%`;

                        // accuracy
                        document.getElementById('accuracy').innerText = s.shotsAccuracy.displayValue;
                        document.getElementById('accuracy-percentile').innerText = `Top ${(100 - s.shotsAccuracy.percentile).toFixed(0)}%`;

                        // kill streak
                        document.getElementById('kill-streak').innerText = s.killStreak.displayValue;
                        document.getElementById('kill-streak-percentile').innerText = `Top ${(100 - s.killStreak.percentile).toFixed(0)}%`;

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
                        document.getElementById('score-min-percentile').innerText = `Top ${(100 - s.scorePerMinute.percentile).toFixed(0)}%`;

                        // k/d
                        document.getElementById('kd').innerText = s.kdRatio.displayValue;
                        document.getElementById('kd-percentile').innerText = `Top ${(100 - s.kdRatio.percentile).toFixed(0)}%`;

                        // win %
                        document.getElementById('win').innerText = s.wlPercentage.displayValue;
                        document.getElementById('win-percentile').innerText = `Top ${(100 - s.wlPercentage.percentile).toFixed(0)}%`;

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

                    const encodedUrl = encodeURI(`${profileUrl}?ref=discord`);

                    fs.unlinkSync(filePath);

                    return {
                        content: `**For all stats, visit: <${encodedUrl}>**`,
                        files  : [attachment]
                    };
                }

                default:
                    return 'Invalid game selection.';
            }
        })
        .catch((e) => {
            return `An uncaught error occurred: ${e.message}`;
        })
        .then((opts) => {
            return interaction.editReply(opts);
        });

};