const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Blog_categorySchema = new Schema({    
    name: {
        type: String,
        required: false
    },
    url_name: {
        type: String,
        required: false
    },
	description: {
		type: String,
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

module.exports = mongoose.model('Blog_category', Blog_categorySchema)