const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry:    { type: String },
    location:    { type: String },
    description: { type: String },
    website:     { type: String },
    size:        { type: String },
    logo:        { type: String }, // file path or URL
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: open positions count
companySchema.virtual('openPositions', {
  ref:         'Job',
  localField:  '_id',
  foreignField: 'company',
  count: true,
});

module.exports = mongoose.model('Company', companySchema);
