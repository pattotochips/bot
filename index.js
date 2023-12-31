import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '!'; // You can change this to your desired command prefix
import dotenv from 'dotenv';
dotenv.config(); // Load the environment variables from the .env file

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

            if (!time || !event || isNaN(time)) {
                return message.channel.send('Usage: !addreminder <time in minutes> <event description>');
            }

            // Mention the current channel using <#channel_id>
            const channelMention = `<#${message.channel.id}>`;

            const reminderTime = parseInt(time, 10) * 60000;
            const reminder = setTimeout(() => {
                message.channel.send(`${channelMention} ${event}`);
                const userReminders = reminders.get(message.author.id);
                userReminders.splice(userReminders.indexOf(reminder), 1);
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

            const [year, month, day] = datePart.split('-');
            const [hours, minutes] = timePart.split(':');

            const parsedDateTime = new Date(year, month - 1, day, hours, minutes);
            const reminderTime = parsedDateTime.getTime() - Date.now();

            // Mention the current channel using <#channel_id>
            const channelMention = `<#${message.channel.id}>`;
          
            if (reminderTime <= 0) {
                return message.channel.send('Please provide a future date and time.');
            }

            const reminder = setTimeout(() => {
                message.channel.send(`${channelMention} ${event}`);
                reminders.delete(message.author.id);
            }, reminderTime);

            reminders.set(message.author.id, reminder);
            message.channel.send(`Reminder set for ${parsedDateTime.toLocaleString()}: ${event}`);
        }
    }
});

client.login(token);