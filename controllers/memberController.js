const Member = require('../models/Member');
const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');
const { validateAddMember } = require('../utils/validators');

exports.addMember = async (req, res) => {
  try {
    const { error } = validateAddMember(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [{ message: error.details[0].message }]
      });
    }

    const { community, user, role } = req.body;
    
    const communityData = await Community.findOne({ id: community });
    if (!communityData) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'Community not found.' }]
      });
    }
    
    if (communityData.owner !== req.user.id) {
      return res.status(403).json({
        status: false,
        errors: [{ message: 'You are not authorized to add members to this community.' }]
      });
    }
    
    const userData = await User.findOne({ id: user });
    if (!userData) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'User not found.' }]
      });
    }
    
    const roleData = await Role.findOne({ id: role });
    if (!roleData) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'Role not found.' }]
      });
    }
    
    const existingMember = await Member.findOne({ community, user });
    if (existingMember) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'User is already a member of this community.' }]
      });
    }
    
    const member = new Member({ community, user, role });
    await member.save();
    
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: member.id,
          community: member.community,
          user: member.user,
          role: member.role,
          created_at: member.created_at
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await Member.findOne({ _id: memberId });
    if (!member) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'Member not found' }]
      });
    }

    await Member.deleteOne({ _id: memberId });

    res.status(200).json({
      status: true
    });

  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({
      status: false,
      errors: [{ message: 'Internal server error' }]
    });
  }
};