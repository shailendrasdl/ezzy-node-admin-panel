const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Announcement_categorySchema = new Schema({    
    name: {
        type: String,
        required: false
    },
	status: {
		type: Boolean,
		default: false
	},
    created_at: {
        type: String
    }
})

module.exports = mongoose.model('Announcement_category', Announcement_categorySchema)