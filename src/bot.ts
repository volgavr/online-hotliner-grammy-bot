import { Bot, Context, session, SessionFlavor } from "grammy";
import {
    conversations,
    createConversation,
    ConversationFlavor,
    Conversation,
} from "@grammyjs/conversations";
import helper from "./helper";
import { continueBtnKeyboard, equipmentBrandKeyboard, equipmentTypeKeyboard, haventGotConfirmationCodeKeyboard, shareMyFirstNameKeyboard, shareMyPhoneNumberKeyboard } from "./keyboards";
import { validate } from "./validation";
import { CANNOT_GET_SMS_CODE_TEXT,
     CONFIRMATION_ATTEMPT_LIMIT,
    NO_MORE_PHOTO_TEXT,
    NEW_ISSUE_DIALOG_NAME,
    SHARE_MY_FIRST_NAME_TEXT,
    } from "./consts";
import { config } from "dotenv";
config(); // Loads from .env

interface IssueData {
    equipmentTypeId: number;
    equipmentBrandId: number;
    serialNumber: string;
    description: string;
    photos: number[];
    video?: number;
    filled: boolean;
}

interface UserContact {
    name: string;
    phone_number: string;
    email: string;
    filled: boolean;
}

// Define the shape of your session
interface SessionData {
    equipmentTypeId: number;
}

// Extend the context to include session data
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor<Context>;

// Session initializer (default values)
function initialSession(): SessionData {
    return {
        equipmentTypeId: 0
    };
}

const bot = new Bot<MyContext>(process.env.API_BOT_TOKEN || "");

// Add session middleware
bot.use(session({ initial: initialSession }));

// Install conversations plugin
bot.use(conversations({
    onEnter(id, ctx) {
        // Entered conversation `id`.
    },
    onExit(id, ctx) {
        ctx.reply("Диалог завершен. Начать заново можно с команды /start");
    },
}));

// --- New issue conversation ---
async function registerIssueDialog(dlg: Conversation<MyContext, MyContext>, ctx: MyContext) {
    const issue: IssueData = {
        equipmentBrandId: 0,
        equipmentTypeId: 0,
        serialNumber: "",
        description: "",
        photos: [],
        filled: false
    };

    //Возможность прервать диалог командой /reset
    // no await!
    dlg.waitForCommand("reset").then(() => dlg.halt());

    // Step 1: Запросим тип оборудования
    await ctx.reply("Пожалуйста, выберите тип оборудования:", {
        reply_markup: equipmentTypeKeyboard
    });

    let ctx1 = await dlg.waitForCallbackQuery(/equip_(\d)/,
        {
            otherwise: (ct) => ct.reply("❌ Пожалуйста, выберите вариант из предложенных.")
        }
    );
    ctx1.answerCallbackQuery();
    issue.equipmentTypeId = Number(ctx1.match[1]);

    // Step 2: Запросим бренд оборудования

    await ctx.reply("✅ Выберите бренд оборудования:", {
        reply_markup: equipmentBrandKeyboard
    });

    ctx1 = await dlg.waitForCallbackQuery(/brand_(\d+)/,
        { otherwise: (ct) => ct.reply("❌ Пожалуйста, выберите вариант из предложенных.") }
    );
    ctx1.answerCallbackQuery();
    issue.equipmentBrandId = Number(ctx1.match[1]);

    // Step 3: Запросим серийный номер
    
    await ctx.reply("✅ Укажите серийный номер оборудования (если номера нет, поставьте дефис: «-»)");
    while (!issue.serialNumber) {
        const { msg } = await dlg.waitFor(":text",
            { otherwise: (ct) => ct.reply("❌ Пожалуйста, введите текстовое сообщение.") }
        );

        const { passed, message, output } = validate('serial', msg.text?.trim());

        if (passed)
            issue.serialNumber = output;
        else {
            ctx.reply("❌ " + message);
        }
    }

    // Step 4: Запросим описание проблемы
    await ctx.reply("✅ Опишите ваш вопрос (проблему), я принимаю до 500 знаков:");
    while (!issue.description) {
        const { msg } = await dlg.waitFor(":text",
            { otherwise: (ct) => ct.reply("❌ Пожалуйста, введите текстовое сообщение.") }
        );

        const { passed, message, output } = validate('description', msg.text?.trim());

        if (passed)
            issue.description = output;
        else {
            ctx.reply("❌ " + message);
        }
    }

    //Step 5. Запросим фото и видео
    await ctx.reply("✅ Добавьте по желанию до 5 фотографий и 1 видео (до 2 минут). Когда загрузите, нажмите кнопку «Продолжить»",
        {
            reply_markup: continueBtnKeyboard
        }
    );
    while (!issue.filled) {
        const { message } = await dlg.waitFor("message");
        if (message.photo) {
            // Handle photo message
        }
        else if (message.video) {
            // Handle video message
        }
        else if (helper.areEqual(NO_MORE_PHOTO_TEXT, message.text)) {
            issue.filled = true;
        }
        else {
            ctx.reply("❌ Пожалуйста, загрузите фото, видео, или нажмите кнопку «Продолжить».");
        }
    }

    const contact: UserContact = { name: '', phone_number: '', email: '', filled: false };

    //Step 6. Запросим контакт
    await ctx.reply("✅ Отлично. Чтобы специалист мог связаться с вами, необходимо оставить номер телефона.",
        {
            reply_markup: shareMyPhoneNumberKeyboard,
        }
    );

    while (!contact.phone_number) {
        const { msg } = await dlg.waitFor(":contact",
            { otherwise: (ct) => ct.reply("❌ Пожалуйста, отправьте ваш номер телефона, нажав на кнопку «Предоставить номер». Без него я не смогу создать заявку.") }
        );

        const { passed, output } = validate('phone-number', msg.contact.phone_number);

        if (passed) {
            contact.phone_number = output;
            contact.name = msg.contact.first_name.concat(' ', msg.contact.last_name ?? '').trimEnd();
        }
        else {
            ctx.reply("❌ К сожалению, я не смогу отправить код подтверждения на этот номер. Требуется российский номер.");
        }
    }

    //Step 7. Запросим код подтверждения
    let { confirmed, attemptCount } = { confirmed: false, attemptCount: 0 };
    await ctx.reply("✅ Принято. Отправил вам СМС с кодом подтверждения, сообщите его мне.",
        {
            reply_markup: haventGotConfirmationCodeKeyboard,
        }
    );
    while (!confirmed) {
        const { msg } = await dlg.waitFor(":text",
            { otherwise: (ct) => ct.reply("❌ Мне нужен текстовый ответ. Попробуйте еще раз") }
        );

        const { passed, message } = validate('one-time-code', msg.text);
        if (passed) {
            if (msg.text == '1111') {
                confirmed = true;
                await ctx.reply("✅ Благодарю!");
            }
            else {
                attemptCount = attemptCount + 1;
                if (attemptCount < CONFIRMATION_ATTEMPT_LIMIT)
                    ctx.reply('❌ Это неверный код, повторите попытку.');
                else {
                    ctx.reply(`❌ Вы ${CONFIRMATION_ATTEMPT_LIMIT} раза ввели неверный код. Отправил вам новый, повторите попытку.`);
                    attemptCount = 0;
                }
            }
        }
        else if (helper.areEqual(CANNOT_GET_SMS_CODE_TEXT, msg.text)) {
            ctx.reply("⚠️ Убедитесь, что вы используете номер российского оператора. Попробуйте повторить позднее");
        }
        else {
            ctx.reply(`❌ ${message} Будьте внимательны.`);
        }
    }

    //Step 8. Запросим E-mail пользователя
    if (!contact.email) {
        await ctx.reply("Укажите, пожалуйста, свою электронную почту, чтобы вы могли отслеживать заявку на сайте. Ваш электронный адрес будет использоваться в качестве логина.",
            {
                reply_markup: { remove_keyboard: true }
            }
        );
    }

    while (!contact.email) {
        const { msg } = await dlg.waitFor(":text",
            { otherwise: (ct) => ct.reply("❌ Мне нужен текстовый ответ. Попробуйте еще раз.") }
        );

        const { passed, output } = validate('email', msg.text?.trim());

        if (passed)
            contact.email = output;
        else {
            ctx.reply("❌ Не похоже на электронную почту. Пожалуйста, введите корректный адрес.");
        }
    }

    //Step 9. Запросим имя пользователя
    await ctx.reply("И последнее, укажите, пожалуйста, ваше имя:",
        {
            reply_markup: shareMyFirstNameKeyboard
        }
    );

    while (!contact.filled) {
        const { msg } = await dlg.waitFor(":text",
            { otherwise: (ct) => ct.reply("❌ Мне нужен текстовый ответ. Попробуйте еще раз.") }
        );

        if (helper.areEqual(SHARE_MY_FIRST_NAME_TEXT, msg.text)) {
            contact.filled = true;
            break;
        }
        
        contact.name = msg.text?.trim();
        contact.filled = true;
    }

    await ctx.reply(`📝 Записал. Отправляю вашу заявку.`,
        // `👤 Type: ${issue.equipmentTypeId}\n` +
        // `⭐ Brand: ${issue.equipmentBrandId}\n` +
        // `📝 Serial: ${issue.serialNumber || ""}\n` +
        // `👤 Name: ${contact.name}\n` +
        // `⭐ Phone: ${contact.phone_number}\n`+
        // `👤 Email: ${contact.email}\n`,
        {
            reply_markup: { remove_keyboard: true }
        }
    );

    // (TODO) Save to database or send to admin here
    const issueNumber = '20230617\\-000';
    
    ctx.reply(
        `✅ Успешно\\! Ваша заявка [${issueNumber}](https://onlinehotline.ru) зарегистрирована на площадке **onlinehotline\\.ru**`,
        {
            parse_mode: "MarkdownV2",
            link_preview_options: { is_disabled: true }
        }
    ).then(() => dlg.halt());
}

// Register the conversation
bot.use(createConversation(registerIssueDialog, NEW_ISSUE_DIALOG_NAME));

// Commands
bot.command("start", async (ctx) => {
    await ctx.conversation.enter(NEW_ISSUE_DIALOG_NAME);
});

// --- Command to trigger the form ---
bot.command("help", async (ctx) => {

});

bot.command("reset", async (ctx) => {
    //exit conversation
    await ctx.conversation.exit(NEW_ISSUE_DIALOG_NAME);
    //reset session
    ctx.session = initialSession();
});

// Start the bot
bot.start();
