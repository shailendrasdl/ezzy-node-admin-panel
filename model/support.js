const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportSchema = new Schema({    
    user_id: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
	email: {
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
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Support', SupportSchema)