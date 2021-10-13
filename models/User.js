const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user:{
        type: String,
        required:true,
        unique: true,
    },
    password: { 
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: false
    }
},
{
    toJSON: {
      virtuals: true,
      // ret is the returned Mongoose document
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    id: false,
},
 {timestamps:true}
)

module.exports = mongoose.model("User", userSchema);
