const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "7061584216:AAHFHLH9kGT33IxRlkaSKWVeoQtaCkZtn4M";
const PAYMENT_PROVIDER_TOKEN = "284685063:TEST:YzVhZmYzNDllMGYz";
const webAppUrl = "https://master--telegrambot322.netlify.app";

const bot = new TelegramBot(token, { polling: true });

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://master--telegrambot322.netlify.app",
    ],
  })
);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(msg);

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
      console.log("be", data);
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

bot.on("pre_checkout_query", (query) => {
  if (isValidPayment(query)) {
    console.log(success)
    bot.answerPreCheckoutQuery(query.id, true);
  } else {
    bot.answerPreCheckoutQuery(query.id, false, "Payment validation failed");
  }
});

function isValidPayment(query) {
  console.log(query);
  return true;
}

app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.send("Express on Vercel");
});

app.get("/check-connection", (req, res) => {
  res.send({ data: "OK" });
  console.log("ok");
});

app.post("/web-data", async (req, res) => {
  try {
    const { queryId, products, totalPrice, chatId } = req.body;

    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Order prepared",
      input_message_content: {
        message_text: "Заказ готовится",
      },
    });

    const title = "Выбранные продукты";
    const description = products.map((item) => item.title).join(", ");
    const payload = "Custom-Payload";
    const currency = "USD";
    const prices = [{ label: "Test Product", amount: totalPrice }];
    const invoiceResponse = await bot.sendInvoice(
      chatId,
      title,
      description,
      payload,
      PAYMENT_PROVIDER_TOKEN,
      currency,
      prices
    );

    return res.status(200).json({ status: "OK" });
  } catch (e) {
    console.log(e);
    const { queryId } = req.body;

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

const PORT = 8000;

app.listen(PORT, () => console.log("server started at port " + 8000));
