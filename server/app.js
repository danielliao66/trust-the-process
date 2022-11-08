const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
const cron = require("node-cron");
const jobs = {};
const {service, user, pass, uri, template} = require("./config");
const mailer = require("nodemailer");
const transporter = mailer.createTransport({service, auth: {user, pass}});
const {MongoClient} = require("mongodb");
const { start } = require("repl");
const client = new MongoClient(uri);
let setup = false;
let currIndex = -1;

init();
const timer = setInterval(checkSetup, 1000);

function run() {
    app.use(cors());

    app.use(express.json());

    app.get("/:reminderId", (req, res) => {
        handleReminders({type: "get", req, res});
    });

    app.post("/", (req, res) => {
        handleReminders({type: "post", req, res});
    });

    app.delete("/:reminderId", (req, res) => {
        handleReminders({type: "delete", req, res})
    });

    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    });
}
async function init() {
    await handleReminders({type: "init"});
    setup = true;
}

async function handleReminders({type, req, res}) {
    try {
        await client.connect();
        const collection = client.db("ttpDatabase").collection("reminders");
        if (type === "init") {
            const reminders = await collection.find().toArray();
            reminders.forEach(({name, email, activity, reminderId, pattern}) => {
                if (reminderId > currIndex) currIndex = reminderId;
                jobs[reminderId] = cron.schedule(pattern, () => sendEmail({name, email, activity, reminderId}));
            });
        }
        else if (type === "get") {
            const reminderId = parseInt(req.params.reminderId);
            const result = await collection.findOne({reminderId});
            res.send(result);
        }
        else if (type === "post") {
            const {name, email, activity, interval} = req.body;
            const pattern = getPattern(interval);
            const reminderId = ++currIndex;
            await collection.insertOne({...req.body, reminderId, pattern});
            jobs[reminderId] = cron.schedule(pattern, () => sendEmail({name, email, activity, reminderId}));
            res.send("OK");
        }
        else if (type === "delete") {
            const reminderId = parseInt(req.params.reminderId);
            await collection.deleteOne({reminderId});
            jobs[reminderId].stop();
            res.send("OK");
        }
    } catch(e) {
        console.error(e);
    } finally {
        client.close();
    }
}

function getPattern(interval) {
    if (interval === "minute")
        return "* * * * *";
    if (interval === "hour")
        return "0 * * * *";
    if (interval === "day")
        return "0 0 * * *";
    if (interval === "week")
        return "0 0 * * 0";
    if (interval === "month")
        return "0 0 1 * *";
    return "0 0 1 1 *";
}

function sendEmail({name, email, activity, reminderId}) {
    const mailOptions = {
        from: user,
        to: email,
        subject: `${activity} reminder`,
        html: template({name, activity, reminderId})
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function checkSetup() {
    if (setup) {
        clearInterval(timer);
        run();
    }
}