const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    ip_address: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        default: null
    },
    user_image: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    // channel_id: {
    //     type: String
    // },
    // youtube_id : {
    //     type: String,
    // },
    // gems_count : {
    //     type: Number,
    //     default: 0
    // },
    // bricks_count : {
    //     type: Number,
    //     default: 0
    // },
    eth_address: {
        type: String,
        required: true
    },
    forgotten_password_time: {
        type: String,
        default: 0
    },
    created_on: {
        type: String
    },
    last_login: {
        type: Date,
        default: null
    },
    sign_in: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: false
    },
    verify_status: {
        type: Boolean,
        default: false
    },
    company: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: 0
    },
    transaction_approval: {
        type: Boolean,
        default: true
    },
    user_referral_code: {
        type: String,
        default: null
    },
    user_token: {
        type: String,
        default: null
    },
    user_referenced_code: {
        type: String,
        default: null
    },
    watch_list_coin: []
})

var Users = mongoose.model('Users', UsersSchema)
module.exports = {
    Users
}