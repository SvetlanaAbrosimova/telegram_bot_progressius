require('dotenv').config();
const { Telegraf } = require('telegraf');
const { keyboardOptions, stopWatchKeyboard } = require('./customKeyboard');
const mongoose = require('mongoose');
const User = require('./models/User');
const textCommands = require('./const');
mongoose.set('strictQuery', false);

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

let seconds = 0;
let interval = null;

const botStart = async () => {

    //database connection 
    const dbURI = process.env.CONNECTION;
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB established");
    }
    )
    .catch((error) => console.error("MongoDB connection failed:", error.message))
    // bot "START" command
    bot.start( async (ctx) => {
        try{
            const chatId = ctx.from.id;
            const user = await User.create({chatId});
        }catch (err){
            return console.log(err);
        }
        await ctx.reply(`Welcome, ${ctx.from.first_name ? ctx.from.first_name : 'Stranger'}! I\`m your Bot Progressius. I can store your progress and time that you spend practicing something`);
        return await ctx.replyWithSticker('https://tlgrm.eu/_/stickers/3d2/135/3d213551-8cac-45b4-bdf3-e24a81b50526/192/13.webp');       
    }) 
    // bot "HELP" command
    bot.help( (ctx) => {
        return ctx.reply(textCommands.commands);
    })

    // bot "PROGRESS" command
    bot.command('progress', async (ctx) => {
        const chatId = ctx.from.id;
        try {
            const user = await User.findOne({chatId})
           
            if (user.amountDays === 0) {
            return await ctx.reply('How many days a week do you want to practice?', keyboardOptions );
            } else {
                return await ctx.reply(`You want to practice ${user.amountDays} days a week. Use /resetprogress to change amount of days`);
            }   
        } catch(e) {
            console.error(e)
        }  
    })
    // bot "RESET PROGRESS" command
    bot.command('resetprogress', async (ctx) => {  
        const chatId = ctx.from.id;
        try { 
            await User.findOne({chatId})
            return await ctx.reply('How many days a week do you want to practice?', keyboardOptions );
        } catch(e) {
            console.error(e)
        }  
    })
    // bot "SHOW PROGRESS" command
    bot.command('showprogress', async (ctx) => {
        try { 
            const chatId = ctx.from.id;
            const user = await User.findOne({chatId}); //database
    
            const today =  new Date();
            const dayNumber = today.getUTCDay();
            await ctx.reply(`Today is ${today}`);
            await ctx.reply(`This is your current progress for today:`);
    
            const dayWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            seconds = user.daysOfWeekChart[dayWeek[dayNumber - 1]];
            ctx.reply(formatTime(ctx, seconds));
            return seconds = 0;
        } catch(e) {
            console.error(e)
        }      
    })
      // bot "REPORT" command
      bot.command('report', async (ctx) => {
        try { 
            const chatId = ctx.from.id;
            const user = await User.findOne({chatId}); //database
            
            const dayWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            let monthData = Object.values(user.daysOfWeekChart);
            const maxResult = Math.max(...monthData);
            const progressDays = monthData.filter(el => el > 0);
            const displayData = Object.entries(user.daysOfWeekChart);
            await ctx.reply(`Days set to practice: ${user.amountDays}`);
            await ctx.reply(`Days you have trained: ${progressDays.length}`);
            await ctx.reply(`The most fruitful day is ${dayWeek[monthData.indexOf(maxResult)]}`);
            if ( user.amountDays < progressDays.length ) {
               await ctx.reply(`You rock!!!`); 
               await ctx.replyWithSticker('https://tlgrm.eu/_/stickers/3d2/135/3d213551-8cac-45b4-bdf3-e24a81b50526/192/108.webp');
            } 
            if ( user.amountDays > progressDays.length ) {
               await ctx.reply(`Hey, do you think you could do better?`); 
               await ctx.replyWithSticker('https://tlgrm.eu/_/stickers/3d2/135/3d213551-8cac-45b4-bdf3-e24a81b50526/192/51.webp');
            } 
            if ( user.amountDays === progressDays.length ) {
               await ctx.reply(`Well done!`); 
               await ctx.replyWithSticker('https://tlgrm.eu/_/stickers/3d2/135/3d213551-8cac-45b4-bdf3-e24a81b50526/192/103.webp'); 
            } 
            let arrStr = displayData.map(el => (el[0] + ' - ' + formatTime(ctx, el[1])).toString()) 
            for (const num of arrStr) {
                await ctx.reply(num);
            }
            return;
        } catch(e) {
            console.error(e)
        }      
    })
    //bot.action function for the command "PROGRESS"
    function addActionBotProgress(num) {
        bot.action(num, async (ctx) => {
            try {
                const chatId = ctx.from.id;
                await ctx.answerCbQuery();
                //chats.days = num;
                const user = await User.findOne({chatId});
                user.amountDays = num;
                await user.save();
                return await ctx.reply(`You set ${user.amountDays} days a week to practice`);
            } catch (e) {
                console.error(e);
            }
        }) 
    }
    addActionBotProgress('1'); 
    addActionBotProgress('2');
    addActionBotProgress('3');
    addActionBotProgress('4');
    addActionBotProgress('5');
    addActionBotProgress('6');
    addActionBotProgress('7');
    // bot "STOPWATCH" command
    bot.command('stopwatch', ctx => {
        return ctx.reply('Click "go", when you`re ready to practice', stopWatchKeyboard);
    });
    function addActionBotStopWatch(name) {
        bot.action(name, async (ctx) => {
            try {
                await ctx.answerCbQuery();
                if (name === 'go') {
                    return start();
                }
                if (name === 'pause') {
                    ctx.reply(`You have practiced ${seconds} seconds`);
                    return pause();
                }
                if (name === 'finish') {
                    const chatId = ctx.from.id;
                    const user = await User.findOne({chatId}); //database
                    const today =  new Date();
                    const dayNumber = today.getDay();
                    const dayWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    user.daysOfWeekChart[dayWeek[dayNumber - 1]] += seconds; 
                    ctx.reply(`You finished practicing with ${seconds}`);
                    await user.save();
                    return reset();
                }                
                } catch (e) {
                console.error(e);
            }
        }) 
    }
    addActionBotStopWatch('go');
    addActionBotStopWatch('pause');
    addActionBotStopWatch('finish');

    const timer = function () {
            seconds++;
        }
    const start = function () {
        if (interval) {
        return 
        }
        interval = setInterval(timer, 1000); // fire a timer function every second
    }
    const pause = function () {
        clearInterval(interval);
        return interval = null;
    }       
    const reset = async function () {
        pause();
        return seconds = 0;
    }
    // Format out time function 
    const formatTime = (ctx, seconds) => {
        let hrs = 0;
        let mins = 0;
        let secs = 0;
        if (seconds >= 3600) {
            hrs = Math.floor(seconds / 3600);
            mins = Math.floor((seconds % (hrs * 3600)) / 60);
            secs = Math.floor(seconds - (hrs * 3600) - (mins * 60));
        } 
        if ( seconds >= 60 && seconds < 3600 ){
            mins = Math.floor(seconds / 60);
            secs = seconds % (mins * 60);
        } 
        if ( seconds < 60 ) secs = seconds;
        return `${hrs} hr : ${mins} min : ${secs} sec`;
    }

    bot.launch();
};

botStart();

