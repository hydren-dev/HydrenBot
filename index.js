const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
const {
    setEmail,
    getEmail,
    setDailyClaimed,
    isDailyClaimed,
    setCoins,
    getCoins,
    setWeeklyClaimed,
    isWeeklyClaimed,
} = require('./db'); // Import your db functions

// Load environment variables
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on('ready', () => {
    console.log('Bot is online!');
});

// Bot command handling

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);
    const command = args[0].toLowerCase();
    const email = args.slice(1).join(' ');

    if (!command.startsWith(process.env.PREFIX)) return;

    const userId = message.author.id;

   if (command === `${process.env.PREFIX}!mine` && args[1] === 'daily') {
        const alreadyClaimed = await isDailyClaimed(userId);
        if (alreadyClaimed) {
            return message.channel.send('You have already claimed your daily coins.');
        }

        const coins = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

        const userEmail = await getEmail(userId);
        if (!userEmail) {
            return message.channel.send('Your email is not connected. Please connect it using `prefix!connect [email]`.');
        }

        try {
            await axios.get(`${process.env.HYDREN_URL}/api/addcoins`, {
                params: {
                    key: process.env.HYDREN_KEY,
                    coins,
                    email: userEmail,
                },
            });
        } catch (error) {
            console.error('Error adding coins:', error);
            return message.channel.send('There was an error adding your coins. Please try again later.');
        }

        await setDailyClaimed(userId);
        await setCoins(userId, coins);

        const embed = new EmbedBuilder()
            .setTitle('Daily Mine')
            .setDescription(`You have mined your daily coins!\nYou now have ${coins} coins.`)
            .setColor('#FFD700');

        message.channel.send({ embeds: [embed] });
    }

     if (command === `${process.env.PREFIX}!mine` && args[1] === 'weekly') {
        const alreadyClaimed = await isWeeklyClaimed(userId); // Check weekly claim status
        if (alreadyClaimed) {
            return message.channel.send('You have already claimed your weekly coins.');
        }

        const coins = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // Adjusted for randomness
        const userEmail = await getEmail(userId);
        if (!userEmail) {
            return message.channel.send('Your email is not connected. Please connect it using `prefix!connect [email]`.');
        }

        try {
            await axios.get(`${process.env.HYDREN_URL}/api/addcoins`, {
                params: {
                    key: process.env.HYDREN_KEY,
                    coins,
                    email: userEmail,
                },
            });
        } catch (error) {
            console.error('Error adding coins:', error);
            return message.channel.send('There was an error adding your coins. Please try again later.');
        }

        await setWeeklyClaimed(userId); // Mark weekly claim
        await setCoins(userId, coins);

        const embed = new EmbedBuilder()
            .setTitle('Weekly Mine')
            .setDescription(`You have mined your weekly coins!\nYou now have ${coins} coins.`)
            .setColor('#FFD700');

        message.channel.send({ embeds: [embed] });
    }

    if (command === `${process.env.PREFIX}!connect`) {
        if (!email) {
            return message.channel.send('Please provide an email to connect.');
        }

        await setEmail(userId, email);
        message.channel.send(`Your email has been connected: ${email}`);
    }

    if (command === `${process.env.PREFIX}!links`) {
        const embed = new EmbedBuilder()
            .setTitle('Links')
            .setDescription(`Here is the Dashboard URL: [ClickME](${process.env.HYDREN_URL})`)
            .setColor('#00FF00'); // You can change the color as needed

        message.channel.send({ embeds: [embed] });
    }
});

// Start the bot
client.login(process.env.TOKEN);
