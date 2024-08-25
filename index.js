require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Slash command setup
client.on('ready', async () => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const commands = guild.commands;

    const meCommand = new SlashCommandBuilder()
        .setName('me')
        .setDescription('Fetch user info based on email')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('The email of the user')
                .setRequired(true)
        );

    await commands.create(meCommand);
    console.log('Slash command /me registered.');
});

// Respond to the /me command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    if (commandName === 'me') {
        const email = options.getString('email');

        try {
            // Fetch user info
            const userInfoResponse = await axios.get(`${process.env.HYDREN_DASHBOARD_URL}/api/application/user/info`, {
                params: {
                    key: process.env.HYDREN_DASHBOARD_KEY,
                    email: email,
                },
            });
            const userInfo = userInfoResponse.data;

            // Fetch user coins
            const coinsResponse = await axios.get(`${process.env.HYDREN_DASHBOARD_URL}/api/application/user/coins`, {
                params: {
                    key: process.env.HYDREN_DASHBOARD_KEY,
                    email: email,
                },
            });
            const coins = coinsResponse.data.coins;

            // Ensure all numeric values are converted to strings
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('User Info')
                .addFields(
                    { name: 'UserID', value: userInfo.id?.toString() || 'N/A', inline: true },
                    { name: 'CPU', value: userInfo.cpu?.toString() || 'N/A', inline: true },
                    { name: 'RAM', value: userInfo.ram?.toString() || 'N/A', inline: true },
                    { name: 'Disk', value: userInfo.disk?.toString() || 'N/A', inline: true },
                    { name: 'Email', value: email, inline: true },
                    { name: 'Coins', value: coins?.toString() || 'N/A', inline: true },
                )
                .setTimestamp();

            // Send the embed message
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while fetching the data.', ephemeral: true });
        }
    }
});


// Log in to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);
