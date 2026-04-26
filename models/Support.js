const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isEducatorInitiated: {
    type: Boolean,
    default: false
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'replied', 'resolved'],
    default: 'open'
  },
  replies: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
supportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
