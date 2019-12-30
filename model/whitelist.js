const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WhiteListSchema = new Schema({
    address: {
        type: String,
        required: true
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
});

module.exports = mongoose.model('Whitelist', WhiteListSchema)

