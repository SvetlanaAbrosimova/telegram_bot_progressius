//Create Custom Keyboard
module.exports = {
    keyboardOptions: {
        reply_markup: JSON.stringify ({
            inline_keyboard: [
            [
                {text: '1', callback_data: '1'}, 
                {text: '2', callback_data: '2'},
                {text: '3', callback_data: '3'},
                {text: '4', callback_data: '4'},
                {text: '5', callback_data: '5'},
                {text: '6', callback_data: '6'},
                {text: '7', callback_data: '7'},
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
        })
    },
    stopWatchKeyboard: {
        reply_markup: JSON.stringify ({
            inline_keyboard: [
            [
                {text: 'go', callback_data: 'go'}, {text: 'pause', callback_data: 'pause'}
            ],
            [
                {text: 'finish', callback_data: 'finish'}
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
        })
    },
        
}

