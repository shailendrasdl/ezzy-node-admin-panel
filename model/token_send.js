const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Token_sendSchema = new Schema({    
    token_address: {
        type: String,
        required: true
    },
    to_address: {
        type: String,
        required: true
    },
	decimals: {
		type: String,
		required: false
	},
	amount: {
		type: String,
		required: false
	},
	transaction_id: {
		type: String,
		required: false
	},
	time: {
		type: String,
		required: false
	},
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Token_send', Token_sendSchema)