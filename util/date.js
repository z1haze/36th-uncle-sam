const dayjs = require('dayjs');

function parseTime (input, past = false, date) {
    const delimiters = ['y', 'M', 'w', 'd', 'h', 'm', 's'];
    let time;

    if (!date) {
        time = dayjs();
    } else if (date instanceof dayjs) {
        time = date;
    } else if (date instanceof Date) {
        time = dayjs(date);
    }

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

        if (past) {
            // subtract time from now
            time = time.subtract(amount, delimiter);
            input = input.substring(input.indexOf(delimiter) + 1);
        } else {
            // add time to now
            time = time.add(amount, delimiter);
            input = input.substring(input.indexOf(delimiter) + 1);
        }

        // if there is no more string to parse, we are done
        if (!input.length) {
            break;
        }
    }

    return time;
}

/**
 * Get a time in the future using a string based duration format
 *
 * @param input
 * @param fromDate
 */
function getTimeFuture (input, fromDate = null) {
    if (!input.length) {
        throw new Error('Input string cannot be empty');
    }

    return parseTime(input, false, fromDate);
}

/**
 * Get a time in the past using a string based duration format
 *
 * @param input
 * @param fromDate
 */
function getTimePast (input, fromDate = null) {
    return parseTime(input, true, fromDate);
}

module.exports = {
    getTimePast,
    getTimeFuture
};