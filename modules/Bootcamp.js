const mongoose = require('mongoose');
const slufigy = require('slugify');
const geocoder = require('../utils/geocoder');
const User = require('./User');
const BootcampScheme = new mongoose.Schema({
  
    name:{
        type:String,
        required:[true,'please add a name'],
        unique:true,
        maxlength:[50,"a name cannot be longer than 50 chars"],
    },

    slug:String,
    description:{
        type:String,
        required:[true, 'Please add description'],
        maxlength:[500,"description cannot be longer than 500 chars"],

    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
      },
      phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      address: {
        type: String,
        required: [true, 'Please add an address, 3']
      },

      location: {
        // GeoJSON Point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
      },
      careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
          'Web Development',
          'Mobile Development',
          'UI/UX',
          'Data Science',
          'Business',
          'Other'
        ]
      },

      averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
      },
      averageCost: Number,
      photo: {
        type: String,
        default: 'no-photo.jpg'
      },
      housing: {
        type: Boolean,
        default: false
      },
      jobAssistance: {
        type: Boolean,
        default: false
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      },
      acceptGi: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
      }

},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});
/*
coordinates: {
  type: [Number],
  index: '2dsphere'
},
formattedAddress: String,
street: String,
city: String,
state: String,
zipcode: String,
country: String
},
*/
BootcampScheme.pre('save', async function(next){
  
  
  // slugify name
  console.log(`slugify run:${this.name}`);
  this.slug = slufigy(this.name,{lower:true});

  // create lcoation field
  const loc = await geocoder.geocode(this.address);
  this.location={
    type:'Point',
    coordinates: [loc[0].longitude,loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  //do not save adress to db
  this.address=undefined;
  next();
});

// populate with virutals,
BootcampScheme.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});



BootcampScheme.pre('remove',async function(next){
  console.log(`courses beign removed from bootcamp:${this._id}`);
  await this.model('Course').deleteMany({bootcamp:this._id});
  next();

});

module.exports = mongoose.model('Bootcamp',BootcampScheme);