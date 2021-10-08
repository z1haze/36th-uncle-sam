const sqlite3 = require('sqlite3').verbose();

let db;

async function getDb () {
    if (db) {
        return db;
    }

    db = await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(`./db/${process.env.EVENT_DB_NAME}.db`, (err) => {
            if (err) {
                reject(err);
            }

            // eslint-disable-next-line no-console
            console.log(`Connected to database: ${process.env.EVENT_DB_NAME}`);

            db.serialize(() => {
                db.run('CREATE TABLE IF NOT EXISTS events(channel_id text, message_id text, event_ending text)', (err) => {
                    if (err) {
                        reject(err);
                    }

                    // eslint-disable-next-line no-console
                    console.log('Event tables initialized');

                    resolve(db);
                });
            });
        });
    });

    return db;
}

module.exports = getDb;