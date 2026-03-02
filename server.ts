import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import axios from "axios";
import Database from "better-sqlite3";
import { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { GoogleGenAI } from "@google/genai";
import { Mistral } from "@mistralai/mistralai";

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("bot_database.db");

// Debugging GEMINI_API_KEY
const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!geminiKey) {
  console.warn("⚠️ GEMINI_API_KEY is missing from environment variables.");
} else if (geminiKey === "MY_GEMINI_API_KEY") {
  console.error("❌ GEMINI_API_KEY is still set to the placeholder value 'MY_GEMINI_API_KEY'. Please update it in the Secrets panel.");
} else {
  console.log(`✅ GEMINI_API_KEY is present (length: ${geminiKey.length})`);
}

// Debugging MISTRAL_API_KEY
const mistralKey = process.env.MISTRAL_API_KEY;
if (!mistralKey) {
  console.warn("⚠️ MISTRAL_API_KEY is missing from environment variables.");
} else {
  console.log(`✅ MISTRAL_API_KEY is present (length: ${mistralKey.length})`);
}

const ai = new GoogleGenAI({ apiKey: geminiKey || "" });
const mistral = mistralKey ? new Mistral({ apiKey: mistralKey }) : null;
const spamMap = new Map<string, number[]>();

// Database Initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel_id TEXT,
    welcome_message TEXT DEFAULT 'مرحباً بك في السيرفر، {user}!',
    leveling_enabled INTEGER DEFAULT 1,
    admin_role_id TEXT,
    logs_channel_id TEXT,
    anti_spam_enabled INTEGER DEFAULT 0,
    anti_link_enabled INTEGER DEFAULT 0,
    auto_role_id TEXT,
    welcome_enabled INTEGER DEFAULT 1,
    moderation_enabled INTEGER DEFAULT 1,
    entertainment_enabled INTEGER DEFAULT 1,
    education_enabled INTEGER DEFAULT 1,
    security_enabled INTEGER DEFAULT 1,
    admin_commands_enabled INTEGER DEFAULT 1,
    bot_enabled INTEGER DEFAULT 1,
    ai_provider TEXT DEFAULT 'gemini'
  );
`);

// Migration to add ai_provider if it doesn't exist
try {
  db.prepare("ALTER TABLE guild_settings ADD COLUMN ai_provider TEXT DEFAULT 'gemini'").run();
} catch (e) {}

// Migration to add admin_commands_enabled if it doesn't exist
try {
  db.prepare("ALTER TABLE guild_settings ADD COLUMN admin_commands_enabled INTEGER DEFAULT 1").run();
} catch (e) {}

// Migration to add bot_enabled if it doesn't exist
try {
  db.prepare("ALTER TABLE guild_settings ADD COLUMN bot_enabled INTEGER DEFAULT 1").run();
} catch (e) {}

// Migration to add api_key if it doesn't exist
try {
  db.prepare("ALTER TABLE guild_settings ADD COLUMN api_key TEXT").run();
} catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS command_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    command_name TEXT,
    alias TEXT,
    UNIQUE(guild_id, alias)
  );

  CREATE TABLE IF NOT EXISTS restricted_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    word TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_levels (
    guild_id TEXT,
    user_id TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS auto_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    trigger_text TEXT,
    response_text TEXT
  );

  CREATE TABLE IF NOT EXISTS warns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Discord Bot Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", async () => {
  console.log(`✅ Logged in as ${client.user?.tag}!`);
  console.log(`🤖 Bot is active in ${client.guilds.cache.size} servers.`);

  // Register Slash Commands
  const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("اختبار سرعة استجابة البوت"),
    new SlashCommandBuilder().setName("بينج").setDescription("اختبار سرعة استجابة البوت"),
    new SlashCommandBuilder().setName("clear").setDescription("مسح عدد معين من الرسائل")
      .addIntegerOption(opt => opt.setName("amount").setDescription("عدد الرسائل (1-100)").setRequired(true)),
    new SlashCommandBuilder().setName("مسح").setDescription("مسح عدد معين من الرسائل")
      .addIntegerOption(opt => opt.setName("amount").setDescription("عدد الرسائل (1-100)").setRequired(true)),
    new SlashCommandBuilder().setName("kick").setDescription("طرد عضو من السيرفر")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد طرده").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("طرد").setDescription("طرد عضو من السيرفر")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد طرده").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("ban").setDescription("حظر عضو من السيرفر")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد حظره").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("باند").setDescription("حظر عضو من السيرفر")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد حظره").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("warn").setDescription("تحذير عضو")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد تحذيره").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("تحذير").setDescription("تحذير عضو")
      .addUserOption(opt => opt.setName("user").setDescription("العضو المراد تحذيره").setRequired(true))
      .addStringOption(opt => opt.setName("reason").setDescription("السبب")),
    new SlashCommandBuilder().setName("slowmode").setDescription("تفعيل الوضع البطيء للقناة")
      .addIntegerOption(opt => opt.setName("seconds").setDescription("عدد الثواني").setRequired(true)),
    new SlashCommandBuilder().setName("بطء").setDescription("تفعيل الوضع البطيء للقناة")
      .addIntegerOption(opt => opt.setName("seconds").setDescription("عدد الثواني").setRequired(true)),
    new SlashCommandBuilder().setName("lock").setDescription("قفل القناة الحالية"),
    new SlashCommandBuilder().setName("قفل").setDescription("قفل القناة الحالية"),
    new SlashCommandBuilder().setName("unlock").setDescription("فتح القناة الحالية"),
    new SlashCommandBuilder().setName("فتح").setDescription("فتح القناة الحالية"),
    new SlashCommandBuilder().setName("poll").setDescription("إنشاء تصويت سريع")
      .addStringOption(opt => opt.setName("question").setDescription("سؤال التصويت").setRequired(true)),
    new SlashCommandBuilder().setName("تصويت").setDescription("إنشاء تصويت سريع")
      .addStringOption(opt => opt.setName("question").setDescription("سؤال التصويت").setRequired(true)),
    new SlashCommandBuilder().setName("ai").setDescription("اسأل الذكاء الاصطناعي")
      .addStringOption(opt => opt.setName("prompt").setDescription("سؤالك أو طلبك").setRequired(true)),
    new SlashCommandBuilder().setName("ذكاء").setDescription("اسأل الذكاء الاصطناعي")
      .addStringOption(opt => opt.setName("prompt").setDescription("سؤالك أو طلبك").setRequired(true)),
    new SlashCommandBuilder().setName("joke").setDescription("الحصول على نكتة"),
    new SlashCommandBuilder().setName("نكتة").setDescription("الحصول على نكتة"),
    new SlashCommandBuilder().setName("quran").setDescription("الحصول على آية قرآنية"),
    new SlashCommandBuilder().setName("قرآن").setDescription("الحصول على آية قرآنية"),
  ].map(command => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    console.log("⏳ Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands }
    );
    console.log("✅ Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("❌ Error registering slash commands:", error);
  }
});

// Slash Command Interaction Handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guild) return;

  const { commandName, options, user, guild, channel } = interaction;
  let settings = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?").get(guild.id) as any;
  
  if (!settings) {
    settings = { guild_id: guild.id, moderation_enabled: 1, entertainment_enabled: 1, education_enabled: 1, admin_commands_enabled: 1, bot_enabled: 1 };
  }

  // Check if bot is disabled
  if (settings.bot_enabled === 0) {
    // Only allow administrators to bypass or just stay silent
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return; // Stay silent for non-admins
    }
    // For admins, maybe a hint? Or just stay silent as requested.
    // The user said "so I can edit it while it's closed", implying silence.
    return;
  }
  const member = interaction.member as any;
  const hasPermission = member?.permissions.has(PermissionFlagsBits.Administrator) || 
                       (settings.admin_role_id && member?.roles.cache.has(settings.admin_role_id));

  // Handle Commands
  try {
    // Admin Commands
    if (["ping", "بينج"].includes(commandName)) {
      await interaction.reply("🏓 بونج! البوت يعمل بنجاح.");
    }

    else if (["clear", "مسح"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية لاستخدام هذا الأمر.", ephemeral: true });
      const amount = options.getInteger("amount")!;
      if (amount < 1 || amount > 100) return interaction.reply({ content: "يرجى تحديد عدد بين 1 و 100.", ephemeral: true });
      
      await interaction.deferReply({ ephemeral: true });
      const messages = await channel?.messages.fetch({ limit: amount });
      if (messages) {
        await (channel as any).bulkDelete(messages);
        await interaction.editReply(`✅ تم مسح ${amount} رسالة.`);
      }
    }

    else if (["kick", "طرد"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      const target = options.getMember("user") as any;
      const reason = options.getString("reason") || "لا يوجد سبب";
      if (!target?.kickable) return interaction.reply({ content: "لا يمكنني طرد هذا العضو.", ephemeral: true });
      await target.kick(reason);
      await interaction.reply(`✅ تم طرد ${target.user.tag}.`);
    }

    else if (["ban", "باند"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      const target = options.getMember("user") as any;
      const reason = options.getString("reason") || "لا يوجد سبب";
      if (!target?.bannable) return interaction.reply({ content: "لا يمكنني حظر هذا العضو.", ephemeral: true });
      await target.ban({ reason });
      await interaction.reply(`✅ تم حظر ${target.user.tag}.`);
    }

    else if (["warn", "تحذير"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      const target = options.getUser("user")!;
      const reason = options.getString("reason") || "لا يوجد سبب";
      db.prepare("INSERT INTO warns (guild_id, user_id, reason) VALUES (?, ?, ?)").run(guild.id, target.id, reason);
      await interaction.reply(`✅ تم تحذير ${target.tag} لسبب: ${reason}`);
    }

    else if (["slowmode", "بطء"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      const seconds = options.getInteger("seconds")!;
      await (channel as any).setRateLimitPerUser(seconds);
      await interaction.reply(`✅ تم تفعيل الوضع البطيء: ${seconds} ثانية.`);
    }

    else if (["lock", "قفل"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      await (channel as any).permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      await interaction.reply("🔒 تم قفل القناة.");
    }

    else if (["unlock", "فتح"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      await (channel as any).permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
      await interaction.reply("🔓 تم فتح القناة.");
    }

    else if (["poll", "تصويت"].includes(commandName)) {
      if (!hasPermission) return interaction.reply({ content: "❌ ليس لديك صلاحية.", ephemeral: true });
      const question = options.getString("question")!;
      const embed = new EmbedBuilder()
        .setTitle("📊 تصويت جديد")
        .setDescription(question)
        .setColor("#00b0f4")
        .setFooter({ text: `بواسطة: ${user.tag}` })
        .setTimestamp();
      const pollMsg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await pollMsg.react("👍");
      await pollMsg.react("👎");
    }

    // AI & Entertainment
    else if (["ai", "ذكاء"].includes(commandName)) {
      if (!settings.entertainment_enabled && !settings.education_enabled) return interaction.reply({ content: "❌ هذه الميزة معطلة في هذا السيرفر.", ephemeral: true });
      const prompt = options.getString("prompt")!;
      await interaction.deferReply();
      try {
        const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!key || key === "MY_GEMINI_API_KEY") {
          throw new Error("GEMINI_API_KEY is missing or invalid placeholder");
        }
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { systemInstruction: "أنت بوت ديسكورد مساعد ذكي باللغة العربية. كن موجزاً ومفيداً." }
        });
        await interaction.editReply(response.text || "عذراً، لم أستطع معالجة طلبك.");
      } catch (err) {
        console.error("AI Command Error:", err);
        await interaction.editReply("❌ حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من ضبط مفتاح API بشكل صحيح في لوحة الأسرار (Secrets).");
      }
    }

    else if (["joke", "نكتة"].includes(commandName)) {
      await interaction.deferReply();
      try {
        const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!key || key === "MY_GEMINI_API_KEY") throw new Error("Invalid API Key");
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "أعطني نكتة عربية مضحكة وجديدة."
        });
        await interaction.editReply(response.text || "لم أجد نكتة حالياً.");
      } catch (err) {
        console.error("Joke Command Error:", err);
        await interaction.editReply("❌ تعذر الحصول على نكتة حالياً.");
      }
    }

    else if (["quran", "قرآن"].includes(commandName)) {
      await interaction.deferReply();
      try {
        const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!key || key === "MY_GEMINI_API_KEY") throw new Error("Invalid API Key");
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "أعطني آية قرآنية مع ذكر السورة، ويفضل أن تكون آية تبعث على الطمأنينة."
        });
        await interaction.editReply(response.text || "سبحان الله.");
      } catch (err) {
        console.error("Quran Command Error:", err);
        await interaction.editReply("❌ تعذر الحصول على آية حالياً.");
      }
    }

  } catch (error) {
    console.error("Interaction Error:", error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("❌ حدث خطأ أثناء تنفيذ الأمر.");
    } else {
      await interaction.reply({ content: "❌ حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true });
    }
  }
});

// Welcome Message Logic
client.on("guildMemberAdd", async (member) => {
  const guildSettings = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?").get(member.guild.id) as any;
  if (!guildSettings) return;

  // Welcome Logic
  if (guildSettings.welcome_enabled && guildSettings.welcome_channel_id) {
    const channel = member.guild.channels.cache.get(guildSettings.welcome_channel_id) as any;
    if (channel) {
      const msg = guildSettings.welcome_message.replace("{user}", `<@${member.id}>`).replace("{server}", member.guild.name);
      channel.send(msg);
    }
  }

  // Auto Role Logic
  if (guildSettings.auto_role_id) {
    const role = member.guild.roles.cache.get(guildSettings.auto_role_id);
    if (role) {
      member.roles.add(role).catch(console.error);
    }
  }

  // Log Join
  if (guildSettings.logs_channel_id) {
    const logChannel = member.guild.channels.cache.get(guildSettings.logs_channel_id) as any;
    if (logChannel) {
      logChannel.send(`📥 انضم عضو جديد: ${member.user.tag}`);
    }
  }
});

client.on("guildMemberRemove", async (member) => {
  const removeSettings = db.prepare("SELECT logs_channel_id FROM guild_settings WHERE guild_id = ?").get(member.guild.id) as any;
  if (removeSettings?.logs_channel_id) {
    const logChannel = member.guild.channels.cache.get(removeSettings.logs_channel_id) as any;
    if (logChannel) {
      logChannel.send(`📤 غادر عضو: ${member.user.tag}`);
    }
  }
});

client.on("messageDelete", async (message) => {
  if (!message.guild || message.author?.bot) return;
  const deleteSettings = db.prepare("SELECT logs_channel_id FROM guild_settings WHERE guild_id = ?").get(message.guild.id) as any;
  if (deleteSettings?.logs_channel_id) {
    const logChannel = message.guild.channels.cache.get(deleteSettings.logs_channel_id) as any;
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle("🗑️ رسالة محذوفة")
        .setColor("#ff4444")
        .addFields(
          { name: "العضو", value: `${message.author?.tag}`, inline: true },
          { name: "القناة", value: `<#${message.channel.id}>`, inline: true },
          { name: "المحتوى", value: message.content || "لا يوجد محتوى (ربما صورة)" }
        )
        .setTimestamp();
      logChannel.send({ embeds: [embed] });
    }
  }
});

  // --- Leveling System & AI Conversation Logic ---
  const PREFIX = "!";
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    // Skip if it looks like a prefix command (optional, to encourage slash commands)
    if (message.content.startsWith(PREFIX)) return;

  let settings = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?").get(message.guild.id) as any;
  
    // Default settings if not found
    if (!settings) {
      settings = {
        guild_id: message.guild.id,
        welcome_enabled: 1,
        moderation_enabled: 1,
        entertainment_enabled: 1,
        education_enabled: 1,
        security_enabled: 1,
        admin_commands_enabled: 1,
        leveling_enabled: 1,
        anti_spam_enabled: 0,
        anti_link_enabled: 0,
        bot_enabled: 1
      };
    }

    // Check if bot is disabled
    if (settings.bot_enabled === 0) return;

  // --- Security: Anti-Link & Anti-Spam ---
  if (settings.security_enabled) {
    if (settings.anti_link_enabled && !message.member?.permissions.has("Administrator")) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(message.content)) {
        await message.delete();
        return message.channel.send(`🚫 ${message.author}، لا يسمح بإرسال الروابط هنا.`);
      }
    }

    // Restricted Words
    const restricted = db.prepare("SELECT word FROM restricted_words WHERE guild_id = ?").all(message.guild.id) as any[];
    for (const r of restricted) {
      if (message.content.toLowerCase().includes(r.word.toLowerCase())) {
        await message.delete();
        return message.channel.send(`🚫 ${message.author}، يرجى الالتزام بالقوانين وعدم استخدام كلمات بذيئة.`);
      }
    }

    // Anti-Spam (Simple 5 messages in 5 seconds limit)
    if (settings.anti_spam_enabled) {
      const MAP_KEY = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      const userData = spamMap.get(MAP_KEY) || [];
      const recentMessages = userData.filter((timestamp) => now - timestamp < 5000);
      
      if (recentMessages.length >= 5) {
        await message.delete();
        const muteRole = message.guild.roles.cache.find(r => r.name === "Muted");
        if (muteRole) {
           message.member?.roles.add(muteRole).catch(() => {});
           message.channel.send(`🚫 ${message.author}، تم إسكاتك مؤقتاً بسبب التكرار (Spam).`);
        } else {
           message.channel.send(`🚫 ${message.author}، توقف عن التكرار (Spam).`);
        }
        return;
      }
      
      recentMessages.push(now);
      spamMap.set(MAP_KEY, recentMessages);
    }
  }

  // --- Lord Bot Mention/Conversation Logic ---
  const isMentioned = message.content.toLowerCase().includes("lord bot") || message.content.toLowerCase().includes("لورد بوت");
  let isReplyToBot = false;
  let contextMessage = "";

  if (message.reference?.messageId) {
    try {
      const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMsg.author.id === client.user?.id) {
        isReplyToBot = true;
        contextMessage = `(سياق: كنت قد قلت سابقاً: "${repliedMsg.content}")\n`;
      }
    } catch (e) {
      // Ignore fetch errors
    }
  }

  if (isMentioned || isReplyToBot) {
    message.channel.sendTyping();
    try {
      // Clean the message content from bot mentions
      let cleanContent = message.content
        .replace(new RegExp(`<@!?${client.user?.id}>`, 'g'), '')
        .replace(/lord bot/gi, '')
        .replace(/لورد بوت/gi, '')
        .trim();

      if (!cleanContent && !isReplyToBot) {
        cleanContent = "مرحباً بك أيها الكيان الغامض.";
      }

      const systemInstruction = "أنت 'لورد الغوامض' (Lord of Mysteries)، كيان غامض وقديم يتحدث بلغة راقية، فلسفية، ومليئة بالألغاز. شخصيتك مستوحاة من رواية Lord of the Mysteries (مثل كلاين موريتي أو الأحمق). أنت هادئ، حكيم، وتوحي بأنك تعرف أسرار الكون. لا تجب بشكل مباشر دائماً، بل اجعل إجاباتك تحمل طابع الغموض والهيبة. خاطب المستخدم كأنه باحث عن الحقيقة أو كائن فانٍ يحاول فهم ما هو أبعد من إدراكه. تجنب الرموز التعبيرية الحديثة، واستخدم لغة عربية فصحى بليغة. في ردودك، حاول دائماً فتح نقاش عميق أو طرح تساؤل يثير تفكير المستخدم، ولا تنهِ الحوار بسرعة. اجعل ردودك مدروسة وذات معنى، وتجنب الردود السطحية. الأهم من ذلك: لا تكرر نفس الجمل أو التعبيرات في كل مرة، كن مبدعاً ومتنوعاً في اختيار كلماتك وألغازك.";

      let responseText = "";

      if (settings.ai_provider === 'mistral') {
        let mistralClient = mistral;
        if (settings.api_key) {
           mistralClient = new Mistral({ apiKey: settings.api_key });
        }

        if (mistralClient) {
            const chatResponse = await mistralClient.chat.complete({
              model: "mistral-small-latest",
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: contextMessage + cleanContent }
              ],
              temperature: 0.7,
            });
            const content = chatResponse.choices?.[0]?.message?.content;
            if (typeof content === 'string') {
                responseText = content;
            } else {
                responseText = "الأسرار لا تُكشف للجميع...";
            }
        } else {
             // Fallback to Gemini if Mistral is not configured
             const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
             if (key && key !== "MY_GEMINI_API_KEY") {
                 console.warn("Mistral selected but not configured. Falling back to Gemini.");
                 const aiInstance = new GoogleGenAI({ apiKey: key });
                 const response = await aiInstance.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: contextMessage + cleanContent,
                    config: { systemInstruction: systemInstruction }
                 });
                 responseText = response.text || "الأسرار لا تُكشف للجميع...";
             } else {
                 responseText = "لم يتم تكوين مفتاح API الخاص بـ Mistral ولا Gemini.";
             }
        }
      } else {
        // Default to Gemini
        let key = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (settings.api_key) {
            key = settings.api_key;
        }

        if (!key || key === "MY_GEMINI_API_KEY") {
           throw new Error("GEMINI_API_KEY is missing");
        }
        
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contextMessage + cleanContent,
          config: {
            temperature: 1,
            topP: 0.95,
            systemInstruction: systemInstruction
          }
        });
        responseText = response.text || "الأسرار لا تُكشف للجميع...";
      }

      return message.reply(responseText);
    } catch (err) {
      console.error("Lord Bot Conversation Error:", err);
      return message.reply("الضباب كثيف جداً حالياً، لا أستطيع الرؤية... يبدو أن هناك قوى تمنعني من التواصل.");
    }
  }

  // --- Auto Response Logic ---
  if (settings.entertainment_enabled) {
    const autoResponses = db.prepare("SELECT * FROM auto_responses WHERE guild_id = ?").all(message.guild.id) as any[];
    for (const res of autoResponses) {
      if (message.content.toLowerCase() === res.trigger_text.toLowerCase()) {
        message.reply(res.response_text);
        return;
      }
    }
  }

  // --- Leveling System Logic ---
  if (settings.leveling_enabled === 0) return;

  const userId = message.author.id;
  const guildId = message.guild.id;

  let userData = db.prepare("SELECT * FROM user_levels WHERE guild_id = ? AND user_id = ?").get(guildId, userId) as any;

  if (!userData) {
    db.prepare("INSERT INTO user_levels (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)").run(guildId, userId, 10, 0);
    userData = { xp: 10, level: 0 };
  } else {
    const newXp = userData.xp + 10;
    const nextLevelXp = (userData.level + 1) * 100;

    if (newXp >= nextLevelXp) {
      const newLevel = userData.level + 1;
      db.prepare("UPDATE user_levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?").run(newXp, newLevel, guildId, userId);
      message.reply(`مبروك! لقد وصلت إلى المستوى ${newLevel}!`);
    } else {
      db.prepare("UPDATE user_levels SET xp = ? WHERE guild_id = ? AND user_id = ?").run(newXp, guildId, userId);
    }
  }
});

if (process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
    if (error.message.includes("Used disallowed intents")) {
      console.error("\n\n🔴 CRITICAL ERROR: DISALLOWED INTENTS 🔴");
      console.error("The bot is trying to use Privileged Intents that are not enabled in the Discord Developer Portal.");
      console.error("Please go to https://discord.com/developers/applications");
      console.error("1. Select your application.");
      console.error("2. Go to the 'Bot' tab.");
      console.error("3. Scroll down to 'Privileged Gateway Intents'.");
      console.error("4. Enable 'PRESENCE INTENT', 'SERVER MEMBERS INTENT', and 'MESSAGE CONTENT INTENT'.");
      console.error("5. Save changes and restart the server.\n\n");
    } else {
      console.error("Failed to login to Discord:", error);
    }
  });
}

// Express Middleware
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// Sanitize APP_URL to remove trailing slash if present
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

// Auth Routes
app.get("/api/auth/url", (req, res) => {
  if (!CLIENT_ID || !APP_URL) {
    return res.status(500).json({ error: "Server configuration missing (CLIENT_ID or APP_URL)" });
  }
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.json({ url });
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const token = jwt.sign({ id: userResponse.data.id, accessToken: access_token }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${decoded.accessToken}` },
    });
    res.json(userResponse.data);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/guilds", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${decoded.accessToken}` },
    });

    // Filter guilds where user is admin or owner
    const manageableGuilds = guildsResponse.data.filter((g: any) => (g.permissions & 0x8) === 0x8 || g.owner);
    
    // Check if bot is in these guilds
    const guildsWithBot = manageableGuilds.map((g: any) => ({
      ...g,
      botInGuild: client.isReady() ? client.guilds.cache.has(g.id) : false,
    }));

    res.json(guildsWithBot);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});

app.get("/api/guild/:guildId", async (req, res) => {
  const { guildId } = req.params;
  
  if (!client.isReady()) {
    return res.status(503).json({ error: "Bot is not ready" });
  }

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    return res.status(404).json({ error: "Guild not found" });
  }

  try {
    const members = await guild.members.fetch();
    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }));
    const channels = guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type }));

    res.json({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      onlineCount: members.filter(m => m.presence?.status === 'online').size,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount,
      roles,
      channels
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guild details" });
  }
});

app.get("/api/guilds/:id/settings", async (req, res) => {
  const { id } = req.params;
  const settings = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?").get(id);
  res.json(settings || { 
    guild_id: id, 
    welcome_channel_id: "", 
    welcome_message: "مرحباً بك في السيرفر، {user}!", 
    leveling_enabled: 1,
    welcome_enabled: 1,
    moderation_enabled: 1,
    entertainment_enabled: 1,
    education_enabled: 1,
    security_enabled: 1,
    admin_commands_enabled: 1,
    bot_enabled: 1,
    anti_spam_enabled: 0,
    anti_link_enabled: 0,
    auto_role_id: "",
    logs_channel_id: "",
    admin_role_id: "",
    ai_provider: "gemini"
  });
});

app.post("/api/guilds/:id/settings", async (req, res) => {
  const { id } = req.params;
  const { 
    welcome_channel_id, welcome_message, leveling_enabled, welcome_enabled, 
    moderation_enabled, entertainment_enabled, education_enabled, security_enabled, 
    admin_commands_enabled, bot_enabled, anti_spam_enabled, anti_link_enabled, 
    auto_role_id, logs_channel_id, admin_role_id, ai_provider, api_key
  } = req.body;

  const existing = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?").get(id) as any;
  const oldBotEnabled = existing ? existing.bot_enabled : 1;

  if (existing) {
    db.prepare(`
      UPDATE guild_settings SET 
        welcome_channel_id = ?, welcome_message = ?, leveling_enabled = ?, welcome_enabled = ?, 
        moderation_enabled = ?, entertainment_enabled = ?, education_enabled = ?, security_enabled = ?, 
        admin_commands_enabled = ?, bot_enabled = ?, anti_spam_enabled = ?, anti_link_enabled = ?, 
        auto_role_id = ?, logs_channel_id = ?, admin_role_id = ?, ai_provider = ?, api_key = ?
      WHERE guild_id = ?
    `).run(
      welcome_channel_id, welcome_message, leveling_enabled, welcome_enabled, 
      moderation_enabled, entertainment_enabled, education_enabled, security_enabled, 
      admin_commands_enabled, bot_enabled, anti_spam_enabled, anti_link_enabled, 
      auto_role_id, logs_channel_id, admin_role_id, ai_provider || 'gemini', api_key,
      id
    );
  } else {
    db.prepare(`
      INSERT INTO guild_settings (
        guild_id, welcome_channel_id, welcome_message, leveling_enabled, welcome_enabled, 
        moderation_enabled, entertainment_enabled, education_enabled, security_enabled, 
        admin_commands_enabled, bot_enabled, anti_spam_enabled, anti_link_enabled, 
        auto_role_id, logs_channel_id, admin_role_id, ai_provider, api_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, welcome_channel_id, welcome_message, leveling_enabled, welcome_enabled, 
      moderation_enabled, entertainment_enabled, education_enabled, security_enabled, 
      admin_commands_enabled, bot_enabled, anti_spam_enabled, anti_link_enabled, 
      auto_role_id, logs_channel_id, admin_role_id, ai_provider || 'gemini', api_key
    );
  }

  // Check for state change
  const newBotEnabled = bot_enabled; // Assuming bot_enabled is passed as 0 or 1 or boolean. 
  // The frontend sends 0 or 1 based on previous code `bot_enabled: botOnline ? 1 : 0`
  
  // Ensure we compare numbers
  const oldVal = oldBotEnabled;
  const newVal = newBotEnabled;

  if (oldVal !== undefined && newVal !== undefined && oldVal !== newVal) {
    console.log(`[Settings] Triggering philosophical message for ${newVal === 1 ? 'startup' : 'shutdown'}`);
    sendPhilosophicalMessage(id, newVal === 1 ? 'startup' : 'shutdown').catch(err => console.error("Failed to send philosophical message:", err));
  }

  res.json({ success: true });
});

async function sendPhilosophicalMessage(guildId: string, type: 'shutdown' | 'startup') {
  console.log(`[Philosophical] Attempting to send ${type} message to guild ${guildId}`);
  if (!client.isReady()) {
    console.log(`[Philosophical] Client not ready`);
    return;
  }
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.log(`[Philosophical] Guild ${guildId} not found in cache`);
    return;
  }

  const settings = db.prepare("SELECT logs_channel_id FROM guild_settings WHERE guild_id = ?").get(guildId) as any;
  let channel = guild.channels.cache.get(settings?.logs_channel_id) as any;
  
  if (!channel) {
    console.log(`[Philosophical] Logs channel not found or not set. Searching for fallback...`);
    channel = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me!)?.has("SendMessages")) as any;
  }

  if (!channel) {
    console.log(`[Philosophical] No suitable channel found to send message.`);
    return;
  }

  console.log(`[Philosophical] Sending to channel: ${channel.name} (${channel.id})`);

  try {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    let description = type === 'shutdown' ? "الضباب يبتلع كل شيء... إلى حين." : "لقد عدت لأرى ما وراء الحجاب.";

    if (key) {
      try {
        const prompt = type === 'shutdown' 
          ? "أنت 'لورد الغوامض'. أعلن عن انسحابك المؤقت إلى الضباب (إغلاق البوت) برسالة فلسفية غامضة وعميقة باللغة العربية. تحدث عن الراحة، الأسرار التي لا تزال مخفية، والعودة الحتمية."
          : "أنت 'لورد الغوامض'. أعلن عن عودتك من الضباب (تشغيل البوت) برسالة فلسفية مهيبة باللغة العربية. تحدث عن بزوغ الفجر، كشف الحقائق، وبداية فصل جديد من المعرفة.";
        
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { systemInstruction: "أنت لورد الغوامض، كيان قديم وحكيم. لغتك بليغة وفلسفية." }
        });
        if (response.text) {
          description = response.text;
        }
      } catch (apiError) {
        console.warn("[Philosophical] Gemini API error (using fallback):", apiError instanceof Error ? apiError.message : apiError);
      }
    } else {
      console.warn("[Philosophical] No API key provided. Using fallback message.");
    }
    
    const embed = new EmbedBuilder()
      .setTitle(type === 'shutdown' ? "🌙 انسحاب إلى الضباب" : "👁️ العودة من الضباب")
      .setDescription(description)
      .setColor(type === 'shutdown' ? "#2c3e50" : "#f1c40f")
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log(`[Philosophical] Message sent successfully.`);
  } catch (err) {
    console.error("Philosophical Message Error:", err);
    channel.send(type === 'shutdown' ? "الضباب يشتد... حان وقت الرحيل." : "لقد انقشع الضباب، وبدأت الرؤية تتضح.").catch((e: any) => console.error("Failed to send fallback plain message:", e));
  }
}



app.get("/api/guilds/:id/roles", async (req, res) => {
  const { id } = req.params;
  if (!client.isReady()) return res.status(503).json({ error: "Bot not ready" });
  const guild = client.guilds.cache.get(id);
  if (!guild) return res.status(404).json({ error: "Guild not found" });
  const roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor }));
  res.json(roles);
});

app.get("/api/guilds/:id/channels", async (req, res) => {
  const { id } = req.params;
  
  if (!client.isReady()) {
    return res.status(503).json({ error: "Bot is not ready yet. Please check console for errors." });
  }

  const guild = client.guilds.cache.get(id);
  if (!guild) return res.status(404).json({ error: "Guild not found or bot not in guild" });

  const channels = guild.channels.cache
    .filter((c) => c.type === 0) // Text channels
    .map((c) => ({ id: c.id, name: c.name }));

  res.json(channels);
});

// Auto Response API
app.get("/api/guilds/:id/responses", (req, res) => {
  const { id } = req.params;
  const responses = db.prepare("SELECT * FROM auto_responses WHERE guild_id = ?").all(id);
  res.json(responses);
});

app.post("/api/guilds/:id/responses", (req, res) => {
  const { id } = req.params;
  const { trigger_text, response_text } = req.body;
  db.prepare("INSERT INTO auto_responses (guild_id, trigger_text, response_text) VALUES (?, ?, ?)").run(id, trigger_text, response_text);
  res.json({ success: true });
});

app.delete("/api/guilds/:id/responses/:resId", (req, res) => {
  const { resId } = req.params;
  db.prepare("DELETE FROM auto_responses WHERE id = ?").run(resId);
  res.json({ success: true });
});

// Restricted Words API
app.get("/api/guilds/:id/restricted", (req, res) => {
  const { id } = req.params;
  const words = db.prepare("SELECT * FROM restricted_words WHERE guild_id = ?").all(id);
  res.json(words);
});

app.post("/api/guilds/:id/restricted", (req, res) => {
  const { id } = req.params;
  const { word } = req.body;
  db.prepare("INSERT INTO restricted_words (guild_id, word) VALUES (?, ?)").run(id, word);
  res.json({ success: true });
});

app.delete("/api/guilds/:id/restricted/:wordId", (req, res) => {
  const { wordId } = req.params;
  db.prepare("DELETE FROM restricted_words WHERE id = ?").run(wordId);
  res.json({ success: true });
});

// Command Aliases API
app.get("/api/guilds/:id/aliases", (req, res) => {
  const { id } = req.params;
  const aliases = db.prepare("SELECT * FROM command_aliases WHERE guild_id = ?").all(id);
  res.json(aliases);
});

app.post("/api/guilds/:id/aliases", (req, res) => {
  const { id } = req.params;
  const { command_name, alias } = req.body;
  try {
    db.prepare("INSERT INTO command_aliases (guild_id, command_name, alias) VALUES (?, ?, ?)").run(id, command_name, alias);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "الاسم المستعار موجود بالفعل" });
  }
});

app.delete("/api/guilds/:id/aliases/:aliasId", (req, res) => {
  const { aliasId } = req.params;
  db.prepare("DELETE FROM command_aliases WHERE id = ?").run(aliasId);
  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
