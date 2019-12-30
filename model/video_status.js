const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Video_statusSchema = new Schema({
    channel_id: {
        type: String
    },
    user_id : {
        type: String,
    },
    users_id: {
		type: [String],
		required: false
    },

    youtube_id : {
        type: String,
    },
    // gems_bricks_status : {
    //     type: Number,
    //     default: 0
    // },
    gems_count : {
        type: Number,
        default: 0
    },
    bricks_count : {
        type: Number,
        default: 0
    },
    gems_bricks_status : {
        type: String,
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
});

module.exports = mongoose.model('Video_status', Video_statusSchema);



// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const Video_statusSchema = new Schema({
//     channel_id: {
//         type: String
//     },
// 	user_id: {
// 		type: [String],
// 		required: false
//     },
//     youtube_id : {
//         type: String,
//     },
//     status: {
// 		type: Boolean,
// 		default: false
// 	},
//     created_at: {
//         type: String
//     },
//     updated_at: {
//         type: String
//     }
// })

// module.exports = mongoose.model('Video_status', Video_statusSchema);