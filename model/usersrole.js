const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersroleSchema = new Schema({    
    name: {
        type: String,
        required: true
    },
    permission: {
        type: String,
        default: null
    },
	status:{
		type: Boolean,
		default:true
	},
    created_at: {
        type: String
    },
    updated_at: {
        type: Date,
		default: Date.now
    }
})

var Usersrole = mongoose.model('Usersrole', UsersroleSchema)
module.exports = {
    Usersrole
}