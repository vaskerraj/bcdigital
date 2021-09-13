const mongoose = require('mongoose');

const notiTokenSchema = new mongoose.Schema({
    token: {
        type: String,
    }
}, { timestamps: true });

mongoose.models.NotificationToken || mongoose.model('NotificationToken', notiTokenSchema)

