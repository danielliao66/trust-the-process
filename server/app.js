const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
const cron = require("node-cron");
const jobs = [];
const {service, user, pass, uri, template} = require("./config");
const mailer = require("nodemailer");
const transporter = mailer.createTransport({service, auth: {user, pass}});
const {MongoClient} = require("mongodb");
const client = new MongoClient(uri);

app.use(cors());

app.use(express.json());

app.get("/:reminderId", async (req, res) => {
    try {
        const reminderId = parseInt(req.params.reminderId);
        await client.connect();
        const result = await client.db("ttpDatabase").collection("reminders").findOne({reminderId});
        res.send(result);
    } catch(e) {
        console.error(e);
    } finally {
        client.close();
    }
});

app.post("/", async (req, res) => {
    const {name, email, activity, interval} = req.body;
    let pattern;
    if (interval === "minute") {
        pattern = "* * * * *";
    }
    else if (interval === "hour") {
        pattern = "0 * * * *";
    }
    else if (interval === "day") {
        pattern = "0 0 * * *";
    }
    else if (interval === "week") {
        pattern = "0 0 * * 0";
    }
    else if (interval === "month") {
        pattern = "0 0 1 * *";
    }
    else {
        pattern = "0 0 1 1 *";
    }
    const reminderId = jobs.length;
    try {
        await client.connect();
        await client.db("ttpDatabase").collection("reminders").insertOne({...req.body, reminderId});
    } catch(e) {
        console.error(e);
    } finally {
        client.close();
    }
    jobs.push(cron.schedule(pattern, () => sendEmail({name, email, activity, reminderId})));
    res.send("OK");
});

app.delete("/:reminderId", async (req, res) => {
    const reminderId = parseInt(req.params.reminderId);
    try {
        await client.connect();
        await client.db("ttpDatabase").collection("reminders").deleteOne({reminderId});
    } catch(e) {
        console.error(e);
    } finally {
        client.close();
    }
    jobs[reminderId].stop();
    res.send("OK");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

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