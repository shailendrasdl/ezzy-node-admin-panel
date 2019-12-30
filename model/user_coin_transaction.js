const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User_coin_transactionSchema = new Schema({    
    user_id: {
        type: String,
        required: true
    },
    current_value: {
        type: String,
        required: false
    },
	old_value: {
		type: String,
		required: false
	},
	bonus_value: {
		type: String,
		required: false
	},
	paid_value: {
		type: String,
		required: false
	},
	referenced_code: {
		type: String,
		required: false
	},
	time: {
		type: String,
		required: false
	},
    update_time: {
        type: String
    }
})

module.exports = mongoose.model('User_coin_transaction', User_coin_transactionSchema)