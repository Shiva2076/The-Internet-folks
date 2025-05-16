const Community = require('../models/Community');
const Member = require('../models/Member');
const Role = require('../models/Role');
const { validateCommunityCreate } = require('../utils/validators');
const slugify = require('slugify');
const mongoose = require('mongoose');

exports.createCommunity = async (req, res) => {
  let community;
  try {
    const { error } = validateCommunityCreate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [{ message: error.details[0].message, param: error.details[0].path[0] }]
      });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'Name is required and must be a string', param: 'name' }]
      });
    }


    const slug = slugify(name, { lower: true, strict: true });
    

    const existingCommunity = await Community.findOne({ slug });
    if (existingCommunity) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'Community with this name already exists.', param: 'name' }]
      });
    }
    
    const roleName = req.body.role || 'Admin';
    let role = await Role.findOne({ name: roleName });
    
    if (!role) {
      role = new Role({
        name: roleName,
        scopes: ['all']
      });
      await role.save();
    }
    
    community = new Community({
      name,
      slug,
      owner: req.user.id
    });
    
    await community.save();
    
    const member = new Member({
      community: community.id, 
      user: req.user.id,
      role: role.id           
    });
    
    await member.save();
    
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: community.id,         
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.created_at, 
          updated_at: community.updated_at  
        }
      }
    });
  } catch (err) {
    console.error('Error creating community:', err);
    
    if (community && community.id) {
      await Community.deleteOne({ id: community.id });
    }
    
    res.status(500).json({ 
      status: false, 
      errors: [{ message: err.message || 'Server error during community creation' }] 
    });
  }
};

exports.getAllCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const total = await Community.countDocuments();
    const communities = await Community.find()
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })  
    
    const formattedCommunities = communities.map(community => ({
      id: community.id,         
      name: community.name,
      slug: community.slug,
      owner: community.owner,
      created_at: community.created_at,  
      updated_at: community.updated_at   
    }));
    
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: formattedCommunities
      }
    });
  } catch (err) {
    console.error('Error getting communities:', err);
    res.status(500).json({ 
      status: false, 
      errors: [{ message: err.message || 'Server error while fetching communities' }] 
    });
  }
};

exports.getCommunityMembers = async (req, res) => {
  try {
    const communityId = req.params.id;
    
    const community = await Community.findOne({ id: communityId });
    if (!community) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'Community not found.' }]
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const total = await Member.countDocuments({ community: communityId });
    const members = await Member.find({ community: communityId })
      .skip(skip)
      .limit(limit)
      .populate('user', 'id name')
      .populate('role', 'id name')
      .lean();
    
    const formattedMembers = members.map(member => ({
      id: member.id,          
      community: member.community,
      user: {
        id: member.user.id,   
        name: member.user.name
      },
      role: {
        id: member.role.id,   
        name: member.role.name
      },
      created_at: member.created_at 
    }));
    
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: formattedMembers
      }
    });
  } catch (err) {
    console.error('Error getting community members:', err);
    res.status(500).json({ 
      status: false, 
      errors: [{ message: err.message || 'Server error while fetching community members' }] 
    });
  }
};

exports.getMyOwnedCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const total = await Community.countDocuments({ owner: req.user.id });
    const communities = await Community.find({ owner: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 }) 
      .lean();
    
    const formattedCommunities = communities.map(community => ({
      id: community.id,
      name: community.name,
      slug: community.slug,
      owner: community.owner,
      created_at: community.created_at,  
      updated_at: community.updated_at   
    }));
    
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: formattedCommunities
      }
    });
  } catch (err) {
    console.error('Error getting owned communities:', err);
    res.status(500).json({ 
      status: false, 
      errors: [{ message: err.message || 'Server error while fetching owned communities' }] 
    });
  }
};

exports.getMyJoinedCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const memberCommunities = await Member.find({ user: req.user.id })
      .distinct('community');
    
    const total = await Community.countDocuments({
      id: { $in: memberCommunities },  
      owner: { $ne: req.user.id }
    });
    
    const communities = await Community.find({
      id: { $in: memberCommunities }, 
      owner: { $ne: req.user.id }
    })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })  
      .lean();
    
    const formattedCommunities = communities.map(community => ({
      id: community.id,         
      name: community.name,
      slug: community.slug,
      owner: community.owner,
      created_at: community.created_at, 
      updated_at: community.updated_at   
    }));
    
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: formattedCommunities
      }
    });
  } catch (err) {
    console.error('Error getting joined communities:', err);
    res.status(500).json({ 
      status: false, 
      errors: [{ message: err.message || 'Server error while fetching joined communities' }] 
    });
  }
};