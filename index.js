require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, ActivityType } = require('discord.js');
const axios = require('axios');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Convert the USERS_ID string from the .env file to an array of IDs
const allowedUserIds = process.env.USERS_ID.split(',');

// Slash command setup
client.on('ready', async () => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const commands = guild.commands;

    // Register /me command
    const meCommand = new SlashCommandBuilder()
        .setName('me')
        .setDescription('Fetch user info based on email')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('The email of the user')
                .setRequired(true)
        );

    // Register /addcoins command
    const addCoinsCommand = new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Add coins to a user')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('The email of the user')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('coins')
                .setDescription('The number of coins to add')
                .setRequired(true)
        );

    await commands.create(meCommand);
    await commands.create(addCoinsCommand);

    console.log('Started the Bot And Registered the Commands.');

    // Set bot status
    const statusType = process.env.STATUS_TYPE;
    const status = process.env.STATUS;
    if (statusType && status) {
        client.user.setActivity(status, { type: ActivityType[statusType] });
        console.log(`Status set to ${statusType} ${status}`);
    }
});

// Respond to slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, user } = interaction;

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
    } else if (commandName === 'addcoins') {
        // Check if the user is allowed to use the command
        if (!allowedUserIds.includes(user.id)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const email = options.getString('email');
        const coins = options.getInteger('coins');

        try {
            // Send request to add coins
            const response = await axios.get(`${process.env.HYDREN_DASHBOARD_URL}/api/addcoins`, {
                params: {
                    email,
                    coins,
                    key: process.env.HYDREN_DASHBOARD_KEY
                }
            });

            if (response.status === 200) {
                await interaction.reply(`Successfully added ${coins} coins to ${email}`);
            } else {
                await interaction.reply('Failed to add coins. Please try again.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while adding coins.');
        }
    }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);
