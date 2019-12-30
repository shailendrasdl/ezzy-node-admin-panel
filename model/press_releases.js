const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Press_releasesSchema = new Schema({    
    admin_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },  
	text: {
		type: [String],
		required: false
	},
	link_one: {
		type: String,
		required: false
	},
	link_two: {
		type: String,
		required: false
	},
	link_three: {
		type: String,
		required: false
	},
	start_datetime: {
		type: String,
		required: false
	},
	status: {
		type: Boolean,
		default: true
	},
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Press_releases', Press_releasesSchema)