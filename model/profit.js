const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfitSchema = new Schema({
    ether_amount: {
        type: String,
        required: true
    },
    total_invested_ether_bot: {
        type: String,
        required: true
    },
    evot_amount: {
        type: String,
        required: true
    },
    total_invested_evot_bot: {
        type: String,
        required: true
    },
    ethereum_usd_price: {
        type: String,
        required: true
    },
    evot_usd_price: {
        type: String,
        required: true
    },
    eth_daily_profit: {
        type: String,
        required: true
    },
    evot_daily_profit: {
        type: String,
        required: true
    },
    profit_on_graph: {
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
    // date: {
    //     type: Date,
    //     default: Date.now
    // }
});

module.exports = mongoose.model('Profit', ProfitSchema)