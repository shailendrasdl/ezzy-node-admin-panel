const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const careerSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    username : {
        type: String,
        required: false
    },
    role:{
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    experience: {
        type: String,
        required: false
    },
    subs_drop_down : {
        type: String,
        required: false
    },
    exchange : {
        type : String,
        required: false
    }, 
    facebook_link: {
		type: String,
		required: false
	},
	linkedIn_link: {
		type: String,
		required: false
	},
	instagram_link: {
		type: String,
		required: false
    },
    twitter_link: {
        type: String,
        required: false
    },
    languages : {
        type: String,
        required: false
    },
    project_name: {
        type: String,
        required: false
    },
    contact_number: {
        type: String,
        required: false
    },
    url: {
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

module.exports = mongoose.model('career', careerSchema)
