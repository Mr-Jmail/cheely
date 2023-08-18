const { Telegraf } = require('telegraf')
const bot = new Telegraf("5589950553:AAHiC9FCN1Z-uh2GISlJbwFdijeTssKmC1M");

bot.on("chat_join_request", ctx => {
    var request = ctx.update.chat_join_request
    if(!request.from.username) ctx.telegram.sendMessage(request.user_chat_id, "Привет! У тебя не заполнен nickname твоего аккаунта, а чтобы быть числе тех, кто участвует в розыгрыше — эта информация необходима! Впиши nickname и участвуй в розыгрыше").catch(err => console.log(err))
    else ctx.telegram.sendMessage(request.user_chat_id,  "Поздравляю, теперь ты участник розыгрышей бесплатных билетов на твои любимые мероприятия, следи за трансляциями и лови удачу!")
    ctx.telegram.approveChatJoinRequest(request.chat.id, request.user_chat_id).catch(err => console.log(err))
})

bot.launch();