const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    id: {
        type: String,
    },
    chatId: {
        type: String,
        unique: true,
        lowercase: true,
    },
    amountDays: {
        type: Number,
        default: 0,
    
    },
    daysOfWeekChart: {
        Monday: {
            type: Number,
            default: 0,
        },
        Tuesday: {
            type: Number,
            default: 0,
        },
        Wednesday: {
            type: Number,
            default: 0,
        },
        Thursday: {
            type: Number,
            default: 0,
        },
        Friday: {
            type: Number,
            default: 0,
        },
        Saturday: {
            type: Number,
            default: 0,
        },
        Sunday: {
            type: Number,
            default: 0,
        }, 
    },
});

const User = mongoose.model('user', userSchema);

module.exports = User;