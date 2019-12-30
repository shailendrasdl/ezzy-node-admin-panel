const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DappsSchema = new Schema({    
    dappName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    telegram: {
        type: String
    },
    website: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    networkSelect: {
        type: String,
        required: true
    },
    additionalLink: {
        type: String
    },
    description: {
        type: String
    },
    title: {
        type: String 
    }, 
    contractAddress: {
        type: String,
        unique: true,
        require: true
    }, 
    // contractAddress:[{
    //     address: {
    //         type: String,
    //         unique: true,
    //         require: true
    //     } 
    // }],
    videoUrl: {
        type: String
    },
    dappLogo: {
        type: String,
        required: true
    },
    dappIcon: {
        type: String
    },
    otherImage: {
        type: String
    },
    trxHistorySevenDays: [],
    volume7DaysUsd: {
        type: Number
    },
    volume1DayUsd: {
        type: Number
    },
    volumeChange1DayData: [],
    userChange1DayData: [],
    volumePercentageChange: {
        type: Number,
        default: 0
    },
    userPercentageChange: {
        type: Number,
        default: 0
    },
    activeStatus: {
        type: Boolean,
        default: false
    },
    contractBalance: {
        type: Number,
        default: 0
    },
    usersOneHours: {
        type: Number,
        default: 0
    },
    volumeOneHours: {
        type: Number,
        default: 0
    },
    volumeSevenDays: {
        type: Number,
        default: 0
    },
    transOneHours: {
        type: Number,
        default: 0
    },
    transSevenDays: {
        type: Number,
        default: 0 
    }
})
  
module.exports = mongoose.model('Dapps', DappsSchema)