const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Blog_to_categorySchema = new Schema({    
    blog_id: {
        type: String,
        required: true
    },
    category_id: {
        type: String,
        required: true
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Blog_to_category', Blog_to_categorySchema)