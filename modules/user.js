const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone:{
      type:Number,
      required:true,
      unique: true
    },
    invoices:[
		{
			type: Schema.Types.ObjectId,
			ref: 'Invoice'
		}
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);