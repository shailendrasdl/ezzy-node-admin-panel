const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogsSchema = new Schema({    
    author: {
        type: String,
        required: true
    },
    date_posted: {
        type: String,
        required: false
    },
	title: {
		type: String,
		required: false
	},
	url_title: {
		type: String,
		required: false
	},
	excerpt: {
		type: String,
		required: false
	},
	content: {
		type: String,
		required: false
	},
	feature_image: {
		type: String,
		required: false
	},
	meta_title: {
		type: String,
		required: false
	},
	meta_keywords: {
		type: String,
		required: false
	},
	meta_description: {
		type: String,
		required: false
	},
	status: {
		type: String,
		required: false
	},
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Blogs', BlogsSchema)