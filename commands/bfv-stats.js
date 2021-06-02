/* global window, document, Image */

const { JSDOM } = require('jsdom');
const got = require('got');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = {
    commands           : ['bfvstats'],
    expectedArgs       : '<gamer tag>',
    minArgs            : 1,
    requiredPermissions: ['SEND_MESSAGES'],
    callback           : async (message, args, text) => {
        if (process.env.BFV_STATS_CHANNELS.indexOf(message.channel.id) === -1) {
            return message.reply('Not in this channel');
        }

        message.channel.startTyping();

        const game = 'bfv';
        const platform = 'xbl';
        const username = text.toLowerCase();

        const url = `https://battlefieldtracker.com/${game}/profile/${platform}/${username}/overview`;

        let response;

        try {
            response = await got(url);
        } catch (e) {
            if (e.response.statusCode === 404) {
                message.reply('Player not found. Check your spelling and try again.');
            } else {
                message.reply('something broke, tell wiggls');
            }

            return message.channel.stopTyping();
        }

        const dom = new JSDOM(response.body, {
            url,
            runScripts: 'dangerously'
        });

        // pull data from dom object
        const state = dom.window.__INITIAL_STATE__;

        // extract the data that we need
        const stats = {
            'bfv/stats': state['bfv/stats']
        };

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

        // do the hackery
        await page.evaluate((stats, game, username, platform) => new Promise((resolve) => {
            const x = stats['bfv/stats'].customPlayers[`${game}|${platform}|${username}`];
            const s = x.stats;
            const c = x.classes;
            const a = x.account;

            const promises = [];

            // kills
            document.getElementById('kills').innerText = s.kills.displayValue;
            document.getElementById('kills-percentile').innerText = s.kills.displayPercentile;

            // deaths
            document.getElementById('deaths').innerText = s.deaths.displayValue;
            document.getElementById('deaths-percentile').innerText = s.deaths.displayPercentile;

            // accuracy
            document.getElementById('accuracy').innerText = s.shotsAccuracy.displayValue;
            document.getElementById('accuracy-percentile').innerText = s.shotsAccuracy.displayPercentile;

            // kill streak
            document.getElementById('kill-streak').innerText = s.killStreak.displayValue;
            document.getElementById('kill-streak-percentile').innerText = s.killStreak.displayPercentile;

            // top class
            const topClass = c.sort((c1, c2) => c2.score.value - c1.score.value)[0];
            document.getElementById('top-class').innerText = topClass.class;

            // top class image
            promises.push(new Promise((resolve) => {
                const image = new Image();
                image.onload = resolve;
                image.onerror = resolve;
                image.src = `img/${topClass.class}.png`;

                document.getElementById('top-class-img').setAttribute('src', image.src);
            }));

            // gamer tag
            document.getElementById('name').innerText = a.playerName;

            // time played
            document.getElementById('time-played').innerText = s.timePlayed.displayValue;

            // score per minute
            document.getElementById('score-min').innerText = s.scorePerMinute.displayValue;
            document.getElementById('score-min-percentile').innerText = s.scorePerMinute.displayPercentile;

            // k/d
            document.getElementById('kd').innerText = s.kdRatio.displayValue;
            document.getElementById('kd-percentile').innerText = s.kdRatio.displayPercentile;

            // win %
            document.getElementById('win').innerText = s.wlPercentage.displayValue;
            document.getElementById('win-percentile').innerText = s.wlPercentage.displayPercentile;

            // level
            document.getElementById('level').innerText = s.rank.displayValue;
            document.getElementById('rank').innerText = getRank(s.rank.value);

            // avatar
            promises.push(new Promise((resolve) => {
                const image = new Image();
                image.onload = resolve;
                image.onerror = resolve;
                image.src = a.avatarUrl;

                document.getElementById('avatar').style.backgroundImage = `url('${image.src}')`;
            }));

            return Promise.all(promises)
                .then(() => resolve(undefined));

            function getRank (level) {
                if (level <= 10) {
                    return 'Private';
                }

                if (level <= 19) {
                    return 'Private First Class';
                }

                if (level <= 29) {
                    return 'Lance Corporal';
                }

                if (level <= 39) {
                    return 'Corporal';
                }

                if (level <= 49) {
                    return 'Sergeant';
                }

                if (level <= 99) {
                    return 'Sergeant First Class';
                }

                if (level <= 149) {
                    return 'Sergeant Major';
                }

                if (level <= 199) {
                    return 'Second Lieutenant';
                }

                if (level <= 249) {
                    return 'First Lieutenant';
                }

                if (level <= 299) {
                    return 'Captain';
                }

                if (level <= 349) {
                    return 'Take A Break Dude';
                }
            }

        }), stats, game, username, platform);

        const id = uuidv4();
        const filePath = path.resolve('stats', `${id}.png`);

        await page.screenshot({path: filePath});
        await browser.close();

        const {MessageAttachment} = require('discord.js');
        const image = fs.readFileSync(filePath);
        const attachment = new MessageAttachment(image);

        const encodedUrl = encodeURI(`${url}?ref=discord`);

        await message.reply(`**For your full stats, visit: <${encodedUrl}>**`, attachment);

        fs.unlinkSync(filePath);

        message.channel.stopTyping();
    }
};