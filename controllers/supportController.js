const mongoose = require('mongoose');
const Support = require('../models/Support');

// NUCLEAR-SAFE CONTROLLER
// This controller uses ZERO property access on req.user
// It relies exclusively on req.userId and req.userRole set by verifyToken

exports.createTicket = async (req, res) => {
  console.log('[SUPPORT-CORE] createTicket called | userId:', req.userId, '| role:', req.userRole);
  try {
    const { subject, message, studentId: bodyStudentId } = req.body;
    
    console.log('[SUPPORT-DEBUG] bodyStudentId from req.body:', bodyStudentId);
    console.log('[SUPPORT-DEBUG] req.userId:', req.userId);
    console.log('[SUPPORT-DEBUG] req.userRole:', req.userRole);
    
    // Explicitly determine target student
    let studentId;
    if (req.userRole === 'educator' || req.userRole === 'admin') {
      studentId = bodyStudentId;
      console.log('[SUPPORT-DEBUG] Educator mode: using bodyStudentId as studentId:', studentId);
    } else {
      studentId = req.userId;
      console.log('[SUPPORT-DEBUG] Student mode: using req.userId as studentId:', studentId);
    }

    if (!studentId) {
      console.error('[SUPPORT-CORE] CRITICAL: Invalid or missing studentId');
      return res.status(400).json({ success: false, message: 'Recipient student ID is required' });
    }

    console.log('[SUPPORT-DEBUG] FINAL studentId for ticket:', studentId);
    console.log('[SUPPORT-DEBUG] FINAL initiatorId for ticket:', req.userId);

    const ticket = new Support({
      studentId,
      initiatorId: req.userId,
      isEducatorInitiated: req.userRole === 'educator' || req.userRole === 'admin',
      subject: subject || 'Academic Support Thread',
      message: message || '',
      status: req.userRole === 'educator' ? 'replied' : 'open'
    });

    await ticket.save();
    console.log('[SUPPORT-CORE] Ticket created successfully:', ticket._id, '| studentId:', ticket.studentId, '| initiatorId:', ticket.initiatorId);
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error('[SUPPORT-CORE] createTicket EXCEPTION:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};

exports.getTickets = async (req, res) => {
  console.log('[SUPPORT-CORE] getTickets called | userId:', req.userId, '| role:', req.userRole);
  try {
    const userId = req.userId;
    const role = req.userRole;
    const { studentId: queryStudentId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Auth Fault: Session missing.' });
    }

    let filter = {};
    if (role === 'educator' || role === 'admin') {
      if (queryStudentId) filter.studentId = queryStudentId;
    } else {
      filter.studentId = userId;
    }

    const tickets = await Support.find(filter)
      .populate('studentId', 'name email')
      .populate('initiatorId', 'name email role')
      .populate('replies.senderId', 'name role')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, tickets: tickets || [] });
  } catch (err) {
    console.error('[SUPPORT-CORE] getTickets EXCEPTION:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};

exports.getSupportSummary = async (req, res) => {
  console.log('[SUPPORT-CORE] getSupportSummary called | role:', req.userRole);
  try {
    const role = req.userRole;
    if (role !== 'educator' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Educator role required.' });
    }

    const summary = await Support.aggregate([
      { $sort: { updatedAt: 1 } },
      {
        $group: {
          _id: "$studentId",
          lastMessage: { $last: "$message" },
          lastUpdate: { $last: "$updatedAt" },
          ticketCount: { $sum: 1 }
        }
      },
      // Cast _id to ObjectId in case it was stored as a string
      {
        $addFields: {
          _id: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      // Provide fallback info for students whose user record is missing
      {
        $addFields: {
          studentInfo: {
            $ifNull: [
              "$studentInfo",
              { name: "Unknown Student", email: "N/A" }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastUpdate: 1,
          ticketCount: 1,
          "studentInfo.name": 1,
          "studentInfo.email": 1,
          "studentInfo.photo": 1
        }
      },
      { $sort: { lastUpdate: -1 } }
    ]);

    res.json({ success: true, summary: summary || [] });
  } catch (err) {
    console.error('[SUPPORT-CORE] getSupportSummary EXCEPTION:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};

exports.replyToTicket = async (req, res) => {
  const { id } = req.params;
  const senderId = req.userId;
  console.log('[SUPPORT-CORE] replyToTicket called | id:', id, '| senderId:', senderId);

  try {
    const { message } = req.body;
    
    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Auth Fault: Sender unknown.' });
    }

    const ticket = await Support.findById(id);
    if (!ticket) {
      console.error('[SUPPORT-CORE] replyToTicket: Conversation not found for ID:', id);
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    ticket.replies.push({ senderId: senderId, message: message || '' });
    if (req.userRole === 'educator' || req.userRole === 'admin') {
      ticket.isEducatorInitiated = true; // Mark as educator engaged if they haven't already
    }
    ticket.status = 'replied';
    await ticket.save();

    console.log('[SUPPORT-CORE] Reply saved for ticket:', id);
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('[SUPPORT-CORE] replyToTicket EXCEPTION:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};

exports.resolveTicket = async (req, res) => {
  const { id } = req.params;
  console.log('[SUPPORT-CORE] resolveTicket called | id:', id);
  try {
    const ticket = await Support.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    ticket.status = 'resolved';
    await ticket.save();
    console.log('[SUPPORT-CORE] Ticket resolved:', id);
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('[SUPPORT-CORE] resolveTicket EXCEPTION:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
};
