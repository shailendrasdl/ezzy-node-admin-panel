const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Support_chatSchema = new Schema({    
    ticket: {
        type: String,
        required: true
    },
    to_id: {
        type: String,
        required: true
    },
	from_id: {
		type: String,
		required: false
	},
	message_by: {
		type: String,
		required: false
	},
	message: {
		type: [String],
		required: false
	},
	status: {
		type: Boolean,
		default: false
	},
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Support_chat', Support_chatSchema)