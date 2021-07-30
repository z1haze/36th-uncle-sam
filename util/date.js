const moment = require('moment');

module.exports = {
    getTimeAgo: (input = '') => {
        if (!input.length) {
            throw new Error('Input string cannot be empty');
        }

        const delimiters = ['y', 'M', 'w', 'd', 'h', 'm', 's'];
        let time = moment();

        for (let i = 0; i < delimiters.length; i++) {
            // current delimiter, eg y, m, d, etc
            const delimiter = delimiters[i];

            // if the input does not include this delimiter, we can skip it
            if (!input.includes(delimiter)) {
                continue;
            }

            // split on the delimiter
            const result = input.split(delimiter);
            // parse the length of time
            const amount = Number(result[0]);

            // if the length of time is not a number, fail
            if (isNaN(amount)) {
                throw new Error(`${result[0]} is not a number!`);
            }

            // subtract time from now
            time = time.subtract(amount, delimiter);
            input = input.substring(input.indexOf(delimiter) + 1);

            // if there is no more string to parse, we are done
            if (!input.length) {
                break;
            }
        }

        return time;
    }
};