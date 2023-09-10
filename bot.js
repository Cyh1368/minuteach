const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
permission_ok_roles = ["MOD", "總管理員", "管理員"]

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,            // Server/guild-related events
    GatewayIntentBits.GuildMessages,    // Message-related events
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
  ],
});

function findUser(message, userMention){
  const user = message.guild.members.cache.find((mb) => {
    // Check if the argument is a mention
    if (userMention.startsWith('<@') && userMention.endsWith('>')) {
        const userId = userMention.slice(2, -1); // Extract user ID from mention
        return mb.user.id === userId;
    } else {
        // Check if the argument is a username
        return mb.user.username === userMention;
    }
  });
  if (user) {
    // User found, you can access their username like this
    return user;
  } else {
    return -1;
  }
}
function formatCommands(commandArray) {
  const maxCommandLength = Math.max(...commandArray.map(cmd => cmd.command.length));
  return commandArray
    .map(({ command, description }) => {
      return `- ${command.padEnd(maxCommandLength, ' ')}: ${description}`;
    })
    .join('\n');
}

// Replace 'YOUR_TOKEN' with your bot's token
// R2N2AFBSumJreD4M6OgPm-EVnAoNxegb
const token = 'MTE1MDAyNjc0MjY1NjkyOTgwMg.GUNaZT.ZS1R55hdrxldPSGDCNvKMXASaWnzhVlRxsYusI';

const points = {}; // Object to store user points
var messageLog = "";

client.on('messageCreate', (message) => { // Change 'message' to 'messageCreate'
  if (message.content === 'mt!help') {
    const commands = [
      { command: "mt!help", description: "展開幫忙頁面" },
      { command: "mt!leaderboard", description: "顯示排行榜" },
    ];

    const modCommands = [
      { command: "mt!addpoints @user [value]", description: "幫某人加分" },
      { command: "mt!minuspoints @user [value]", description: "幫某人扣分" },
      { command: "mt!leaderboardbackup", description: "排行榜的 JSON 備份" },
      { command: "mt!showlog", description: "指令 log 檔" },
    ];

    const helpMessage = `
\`\`\`
哈囉! 我是 MinuTeach，一個紀錄講師們教學分鐘數的機器人。

以下是大家都可以用的指令：
${formatCommands(commands)}

以下是管管們才能用的指令：
${formatCommands(modCommands)}
\`\`\`
`;

    message.channel.send(`> **幫助訊息**:${helpMessage}`);
  }

  if (message.content.startsWith('mt!addpoints')) {
    messageLog += `[${new Date().toLocaleString()}] ${message.author.username} ran command: ${message.content}\n`;
    // Check if the user is a moderator
    if (message.member.roles.cache.some((role) => permission_ok_roles.includes(role.name))) {
      const args = message.content.split(' ');
      if (args.length === 3) {
        const userMention = args[1];
        const amount = parseInt(args[2]);

        // Try to find the user in the guild
        const user = message.guild.members.cache.find((mb) => {
          // Check if the argument is a mention
          if (userMention.startsWith('<@') && userMention.endsWith('>')) {
              const userId = userMention.slice(2, -1); // Extract user ID from mention
              return mb.user.id === userId;
          } else {
              // Check if the argument is a username
              return mb.user.username === userMention;
          }
        });

        if (user) {
          // User found, you can access their username like this
          const username = user.user.username;
          if (!isNaN(amount)) {
            if (!points[user]) points[user] = 0;
            points[user] += amount;
            message.channel.send(`${username} 目前有 ${points[user]} 分.`);
          }
        } else {
            message.channel.send(`**${message.member.user.username}** 找不到使用者。`);
        }
      } else {
        // console.log(args.length);
        message.channel.send(`**${message.member.user.username}** 的指令語法錯誤。`);
      }
    } else {
      // console.log(message.member.roles.cache)
      message.channel.send('**${message.member.user.username}** 您的權限不足，無法使用此指令。');
    }
  }

  if (message.content.startsWith('mt!minuspoints')) {
    messageLog += `[${new Date().toLocaleString()}] ${message.author.username} ran command: ${message.content}\n`;
    // Check if the user is a moderator
    if (message.member.roles.cache.some((role) => permission_ok_roles.includes(role.name))) {
      const args = message.content.split(' ');
      if (args.length === 3) {
        const userMention = args[1];
        const amount = parseInt(args[2]);

        // Try to find the user in the guild
        const user = message.guild.members.cache.find((mb) => {
          // Check if the argument is a mention
          if (userMention.startsWith('<@') && userMention.endsWith('>')) {
              const userId = userMention.slice(2, -1); // Extract user ID from mention
              return mb.user.id === userId;
          } else {
              // Check if the argument is a username
              return mb.user.username === userMention;
          }
        });

        if (user) {
          // User found, you can access their username like this
          const username = user.user.username;
          if (!isNaN(amount)) {
            if (!points[user]) points[user] = 0;
            points[user] -= amount;
            message.channel.send(`${username} 目前有 ${points[user]} 分.`);
          }
        } else {
            message.channel.send(`**${message.member.user.username}** 找不到使用者。`);
        }

        
      } else {
        // console.log(args.length);
        message.channel.send(`**${message.member.user.username}** 的指令語法錯誤。`);
      }
    } else {
      // console.log(message.member.roles.cache)
      message.channel.send('**${message.member.user.username}** 您的權限不足，無法使用此指令。');
    }
  }

  if (message.content === 'mt!leaderboard') {
    messageLog += `[${new Date().toLocaleString()}] ${message.author.username} ran command: ${message.content}\n`;
    const sortedPoints = Object.entries(points).sort((a, b) => b[1] - a[1]);

    // Find the maximum length of usernames and points for padding
    const maxUsernameLength = sortedPoints.reduce((maxLength, [user]) => Math.max(maxLength, user.length), 0);
    const maxPointsLength = sortedPoints.reduce((maxLength, [, score]) => Math.max(maxLength, score.toString().length), 0);

    const leaderboard = sortedPoints
        .map(([userMention, score], index) => {
            user = findUser(message, userMention)
            // console.log(user);
            const rank = index + 1;
            const paddedRank = rank.toString().padStart(3, ' ');
            const paddedUsername = user.user.username.padEnd(maxUsernameLength, ' ');
            const paddedScore = score.toString().padStart(maxPointsLength, ' ');
            return `${paddedRank} | ${paddedUsername} | ${paddedScore} 分`;
        })
        .join('\n');

    message.channel.send(`> **排行榜**:\n\`\`\`${leaderboard}\`\`\``);
  }

  if (message.content === 'mt!showlog') {
    messageLog += `[${new Date().toLocaleString()}] ${message.author.username} ran command: ${message.content}\n`;
    if (message.member.roles.cache.some((role) => permission_ok_roles.includes(role.name))) {
      message.channel.send('\n```\n' + messageLog + '\n```');
    } else {
      message.channel.send('**${message.member.user.username}** 您的權限不足，無法使用此指令。');
    }
  }
  if (message.content === 'mt!leaderboardbackup') {
    const jsonPoints = JSON.stringify(points, null, 2); // Convert points object to JSON with pretty formatting
    messageLog += `[${new Date().toLocaleString()}] ${message.author.username} ran command: ${message.content}\n`;
    if (message.member.roles.cache.some((role) => permission_ok_roles.includes(role.name))) {
      message.channel.send('排行榜備份:\n```json\npoints=' + jsonPoints + '\n```');
    } else {
      message.channel.send('**${message.member.user.username}** 您的權限不足，無法使用此指令。');
    }
  }
});

// To make the bot send the JSON representation of the points object into a 
// channel called #bot-log every day at 12:00, 
// you can use the node-cron library to schedule a task to run at the specified time.
// client.once('ready', () => {
//   console.log(`Logged in as ${client.user.tag}`);

//   // Fetch the channels
//   client.channels.fetch()
//     .then((channels) => {
//       console.log(`Fetched ${channels.size} channels.`);
//     })
//     .catch(console.error);
// });
// client.on('ready', () => {
//   client.guilds.cache.forEach(guild => {
//       guild.channels.cache.forEach(channel => {
//           console.log(channel);
//       });
//   });
// });


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  var botLogChannel = -1;
  client.guilds.cache.forEach(guild => {
    guild.channels.cache.forEach(channel => {
      if (channel.name==='bot-log'){
        botLogChannel = channel;
      }
    });
  });

  // console.log("BOTLOG: \n", botLogChannel)
  cron.schedule('0 12 * * *', () => {
    // console.log("Time to log!")
    const jsonPoints = JSON.stringify(points, null, 2); // Convert points object to JSON with pretty formatting

    if (botLogChannel!=-1 && botLogChannel.type === 0) { // 0 means text channel
      botLogChannel.send('定期排行榜備份:\n```json\npoints=' + jsonPoints + '\n```');
    } else {
      console.error('Could not find or access #bot-log channel.');
    }
  });
});

client.login(token);