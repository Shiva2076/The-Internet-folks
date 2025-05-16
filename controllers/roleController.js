const Role = require('../models/Role');
const { validateRoleCreate } = require('../utils/validators');

exports.createRole = async (req, res) => {
  try {
    const { error } = validateRoleCreate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [{ message: error.details[0].message }]
      });
    }

    const { name } = req.body;
    
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'Role already exists.' }]
      });
    }
    
    const role = new Role({ name });
    await role.save();
    
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: role.id,
          name: role.name,
          created_at: role.created_at,
          updated_at: role.updated_at
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const total = await Role.countDocuments();
    const roles = await Role.find()
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });
    
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: roles
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};