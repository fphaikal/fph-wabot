const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const OpenAI = require("openai");
let setting = require("./key.json");
const openai = new OpenAI({ apiKey: setting.keyopenai });
const { setTimeout } = require("timers/promises");
const axios = require("axios");
const formatLongDate = require('./utils/getTime');

const { searchStudent, searchOnsite } = require('./feature/smtiHandler');
module.exports = sansekai = async (client, m, chatUpdate) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
            ? m.message.videoMessage.caption
            : m.mtype == "extendedTextMessage"
              ? m.message.extendedTextMessage.text
              : m.mtype == "buttonsResponseMessage"
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype == "listResponseMessage"
                  ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                  : m.mtype == "templateButtonReplyMessage"
                    ? m.message.templateButtonReplyMessage.selectedId
                    : m.mtype === "messageContextInfo"
                      ? m.message.buttonsResponseMessage?.selectedButtonId ||
                      m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                      m.text
                      : "";
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = '6285765909380@s.whatsapp.net';
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup
      ? await client.groupMetadata(m.chat).catch((e) => { })
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const groupId = m.isGroup ? groupMetadata.id : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd2 && !m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`)
      );
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName),
        chalk.green(groupId)
      );
    } else if (!isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName),
        chalk.green(groupId)
      );
    } else if (!isCmd2 && !m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`)
      );
    }

    if (isCmd2) {
      switch (command) {
        case "help":
        case "menu":
        case "start":
        case "info":
          m.reply(`*Whatsapp Bot OpenAI*
            
*(ChatGPT)*
Cmd: ${prefix}ai 
Tanyakan apa saja kepada AI. 

*(DALL-E)*
Cmd: ${prefix}img
Membuat gambar dari teks

*(Source Code Bot)*
Cmd: ${prefix}sc
Menampilkan source code bot yang dipakai`);
          break;
        case "ai":
        case "openai":
        case "chatgpt":
        case "ask":
          try {
            // tidak perlu diisi apikeynya disini, karena sudah diisi di file key.json
            if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI")
              return reply(
                "Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys"
              );
            if (!text)
              return reply(
                `Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`
              );
            const chatCompletion = await openai.chat.completions.create({
              messages: [{ role: "user", content: q }],
              model: "gpt-3.5-turbo",
            });

            await m.reply(chatCompletion.choices[0].message.content);
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
            } else {
              console.log(error);
              m.reply("Maaf, sepertinya ada yang error :" + error.message);
            }
          }
          break;
        case "sc":
        case "script":
        case "scbot":
          client.sendMessage(from, { text: "Bot ini menggunakan script dari FPH" });
          break;
        // Custom Message
        case "smti":
          try {
            const { message, error } = await searchStudent(q);
            if (message) {
              await m.reply(message);
            } else {
              await m.reply(error);
            }
          } catch (error) {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :" + error.message);
          }
          break;
        case "onsite":
          try {
            const { message, error } = await searchOnsite(q);
            if (message) {
              await m.reply(message);
            } else {
              await m.reply(error);
            }
          } catch (error) {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :" + error.message);
          }
          break;
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              //client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(
                chalk.black(chalk.bgRed("[ ERROR ]")),
                color("command", "turquoise"),
                color(`${prefix}${command}`, "turquoise"),
                color("tidak tersedia", "turquoise")
              );
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              //client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(
                chalk.black(chalk.bgRed("[ ERROR ]")),
                color("command", "turquoise"),
                color(`${prefix}${command}`, "turquoise"),
                color("tidak tersedia", "turquoise")
              );
            }
          }
        }
      }
    }
    if (!isCmd2) {
      switch (command) {
        case "erlan":
        case "Erland":
        case "lan":
        case "land":
          m.reply('Nama Bapak Erland adalah *Edi*')
          client.sendMessage('6285765909380@s.whatsapp.net', { text: `Nama Bapak Erland adalah *Edi*` });
          break;
        case "mada":
        case "da":
        case "narmada":
        case "Mada":
          m.reply(`Nama Bapak Mada adalah *Pepeng*`);
          break;
        case "Haikal":
        case "kal":
        case "haikal":
        case "Mada":
          m.reply(`Mirip Orang Korea ☺️`);
          break;
        case "Maxy":
        case "maxy":
        case "mek":
        case "max":
          m.reply(`Nama Bapak Maxy adalah *Beny*`);
          break;
        case "rel":
        case "darel":
        case "darrel":
        case "Rel":
          m.reply(`Nama Bapak Darrel adalah *Wahyu*`);
          break;
        case "sinyo":
        case "nyo":
        case "Sinyo":
        case "Nyo":
          m.reply(`Nama Bapak Sinyo adalah *Topo*`);
          break;
      }
    }
    async function checkNatashaOnsite() {
      try {
        const apiUrl = "https://api.tierkun.my.id/api/onsite"; // Ganti dengan URL API yang sebenarnya
        const namaYangDiinginkan = "NATASHA CHRISTINA PUTRI"; // Ganti dengan nama yang ingin Anda monitor

        // Lakukan pemanggilan API untuk mendapatkan data terbaru
        const response = await axios.get(apiUrl);
        const latestDataArray = response.data;

        // Bandingkan dengan data sebelumnya (simpan data sebelumnya di variabel atau database)
        if (dataNatashaSebelumnya) {
          // Temukan perbedaan dalam data
          const perubahanData = latestDataArray.filter((latestData) => {
            const dataNatashaSebelumnyaExist = dataNatashaSebelumnya.find((data) => data.id === latestData.id);
            return !dataNatashaSebelumnyaExist || JSON.stringify(dataNatashaSebelumnyaExist) !== JSON.stringify(latestData);
          });

          // Filter hanya nama tertentu
          const namaTertentu = perubahanData.filter((data) => data.Nama.toLowerCase() === namaYangDiinginkan.toLowerCase());

          // Jika terdapat perubahan untuk nama tertentu, kirim pesan
          if (namaTertentu.length > 0) {
            // Hanya ambil nama dan kelas dari nama tertentu
            const pesanPerubahan = namaTertentu.map((data) => `Nama: ${data.Nama}\nKelas: ${data.Kelas}\n\n*SUDAH BERADA DI SMTI*`).join('\n');
            await client.sendMessage('6285765909380@s.whatsapp.net', { text: pesanPerubahan }); // Ganti dengan ID chat yang sebenarnya
            console.log("Pesan berhasil dikirim:", pesanPerubahan);
          }
        }

        // Simpan data terbaru untuk perbandingan di iterasi selanjutnya
        dataNatashaSebelumnya = latestDataArray;
        console.log("Natasha Watching Start")
        // Atur interval polling (setiap 1 detik)
        await setTimeout(1000);
        checkNatashaOnsite(); // Rekursif untuk terus memeriksa perubahan
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    }

    async function checkIdnLiveJkt() {
      try {
        const apiUrl = "https://api.crstlnz.my.id/api/idn_lives"; // Ganti dengan URL API yang sebenarnya

        // Lakukan pemanggilan API untuk mendapatkan data terbaru
        const response = await axios.get(apiUrl);
        const latestDataArray = response.data;

        // Bandingkan dengan data sebelumnya (simpan data sebelumnya di variabel atau database)
        if (dataIdnLiveSebelumnya) {
          // Temukan perbedaan dalam data
          const perubahanData = latestDataArray.filter((latestData) => {
            const dataIdnLiveSebelumnyaExist = dataIdnLiveSebelumnya.find((data) => data.user.id === latestData.user.id);
            return (
              !dataIdnLiveSebelumnyaExist || JSON.stringify(dataIdnLiveSebelumnyaExist) !== JSON.stringify({ ...latestData, view_count: dataIdnLiveSebelumnyaExist.view_count })
            );
          });

          // Jika terdapat perubahan, kirim pesan
          if (perubahanData.length > 0) {
            // Hanya ambil nama dan kelas dari perubahan data
            const pesanPerubahan = perubahanData.map((data) => `${data.user.name} Live IDN\n\n🔴${formatLongDate(data.live_at)}\n🔗 Tonton di IDN App | IDN Web\nhttps://www.idn.app/${data.user.username}/live/${data.slug}\n\n👀 Viewers: ${data.view_count}`).join('\n');
            await client.sendMessage('6285765909380@s.whatsapp.net', { text: pesanPerubahan }); // Ganti dengan ID chat yang sebenarnya
            await client.sendMessage('120363045926374582@g.us', { text: pesanPerubahan }); // Ganti dengan ID chat yang sebenarnya
            console.log("Pesan berhasil dikirim:", pesanPerubahan);
          }
        }

        // Simpan data terbaru untuk perbandingan di iterasi selanjutnya
        dataIdnLiveSebelumnya = latestDataArray;
        console.log("IDN Watching Start")

        // Atur interval polling (setiap 1 detik)
        await setTimeout(1000);
        checkIdnLiveJkt(); // Rekursif untuk terus memeriksa perubahan
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    }

    // Variabel untuk menyimpan data sebelumnya
    let dataNatashaSebelumnya = null;
    let dataIdnLiveSebelumnya = null;

    // Panggil fungsi untuk pertama kali
    checkNatashaOnsite();
    checkIdnLiveJkt()
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
