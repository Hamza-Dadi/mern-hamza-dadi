const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le champ name est obligatoire'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
