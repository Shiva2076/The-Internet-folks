const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().max(64).required(),
  email: Joi.string().email().max(128).required(),
  password: Joi.string().min(6).max(64).required()
});

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const communityCreateSchema = Joi.object({
  name: Joi.string().min(2).max(128).required()
});

const addMemberSchema = Joi.object({
  community: Joi.string().required(),
  user: Joi.string().required(),
  role: Joi.string().required()
});

const roleCreateSchema = Joi.object({
  name: Joi.string().min(2).max(64).required()
});

const validateSignup = (data) => signupSchema.validate(data);
const validateSignin = (data) => signinSchema.validate(data);
const validateCommunityCreate = (data) => communityCreateSchema.validate(data);
const validateAddMember = (data) => addMemberSchema.validate(data);
const validateRoleCreate = (data) => roleCreateSchema.validate(data);

module.exports = {
  validateSignup,
  validateSignin,
  validateCommunityCreate,
  validateAddMember,
  validateRoleCreate
};