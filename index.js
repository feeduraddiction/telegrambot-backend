const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "7061584216:AAHFHLH9kGT33IxRlkaSKWVeoQtaCkZtn4M";

const webAppUrl = "https://master--telegrambot322.netlify.app";

const bot = new TelegramBot(token, { polling: true });

const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(text);

  if (text === "/huesos") {
    bot.sendMessage(chatId, "( . )( . )");
  }

  if (text === "/start") {
    await bot.sendMessage(chatId, "По нажатию кнопки заполните форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });
  }

  if (text === "/start") {
    await bot.sendMessage(chatId, "Заходите в наш магазин", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Сделать заказ", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);
      await bot.sendMessage(chatId, "Спасибо за информацию");
      await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
      await bot.sendMessage(chatId, "Ваша город: " + data?.city);
      setTimeout(async () => {
        await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате");
      }, 1500);
    } catch (e) {
      console.log(e);
    }
  }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body();
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text:
          "Поздравляю с покупкой, приобретен товар на сумму " + totalPrice,
      },
    });
    return res.status(200).json({ status: "OK" });
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось совершить покупку",
      input_message_content: {
        message_text: "Не удалось приобрести товар",
      },
    });
    return res.status(500);
  }
});

const PORT = 800;

app.listen(PORT, () => console.log("server started at port " + 8000));
