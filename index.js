import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '!'; // You can change this to your desired command prefix
import dotenv from 'dotenv';
dotenv.config(); // Load the environment variables from the .env file
import express from 'express';

const reminders = new Map();

const token =  process.env.TOKEN;

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'addreminder') {
            const time = args.shift();
            const event = args.join(' ');

            if (!time || !event || isNaN(time) || parseInt(time, 10) <= 0) {
                return message.channel.send('Usage: !addreminder <time in minutes> <event description>');
            }

            const reminderTime = parseInt(time, 10) * 60000;
            const reminder = setTimeout(() => {
                message.channel.send(`@everyone ${event}`);
                const userReminders = reminders.get(message.author.id);
                if (userReminders) {
                    userReminders.splice(userReminders.indexOf(reminder), 1);
                    if (userReminders.length === 0) reminders.delete(message.author.id);
                }
            }, reminderTime);

            if (!reminders.has(message.author.id)) {
                reminders.set(message.author.id, []);
            }

            reminders.get(message.author.id).push(reminder);

            message.channel.send(`Reminder set for ${time} minutes: ${event}`);
            message.delete(); // Delete the user's command message
        }

        if (command === 'adddaterem') {
            const datePart = args.shift(); // Date in format 'YYYY-MM-DD'
            const timePart = args.shift(); // Time in format 'HH:MM'
            const event = args.join(' ');

            if (!datePart || !timePart || !event) {
                return message.channel.send('Usage: !adddaterem <YYYY-MM-DD> <HH:MM> <event description>');
            }

            // Validate date and time
            const parsedDateTime = new Date(`${datePart}T${timePart}:00`);
            if (isNaN(parsedDateTime.getTime())) {
                return message.channel.send('Invalid date or time format.');
            }

            const reminderTime = parsedDateTime.getTime() - Date.now();

            if (reminderTime <= 0) {
                return message.channel.send('Please provide a future date and time.');
            }

            const reminder = setTimeout(() => {
                message.channel.send(`@everyone ${event}`);
                const userReminders = reminders.get(message.author.id);
                if (userReminders) {
                    userReminders.splice(userReminders.indexOf(reminder), 1);
                    if (userReminders.length === 0) reminders.delete(message.author.id);
                }
            }, reminderTime);

            if (!reminders.has(message.author.id)) {
                reminders.set(message.author.id, []);
            }
            reminders.get(message.author.id).push(reminder);
            message.channel.send(`Reminder set for ${parsedDateTime.toLocaleString()}: ${event}`);
            message.delete(); // Consistent message deletion
        }
    }
});

client.login(token);

// Minimal Express server to keep Render Web Service alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));