const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvertisingSchema = new Schema({    
    ip_address: {
        type: String,
        required: true
    }, 
	admin_id: {
        type: String,
        required: true
    },
	image: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    },
	position: {
		type: String,
		required: false
	},
	duration: {
		type: String,
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

module.exports = mongoose.model('Advertising', AdvertisingSchema)