const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({    
    image: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
	updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Banner', BannerSchema)