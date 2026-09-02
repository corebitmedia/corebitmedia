const sequelize = require('../config/db');
const User = require('./User');
const Page = require('./Page');
const Service = require('./Service');
const BlogPost = require('./BlogPost');
const CaseStudy = require('./CaseStudy');
const SiteSettings = require('./SiteSettings');
const { Testimonial, Faq, ContactSubmission } = require('./misc');

module.exports = {
  sequelize,
  User,
  Page,
  Service,
  BlogPost,
  CaseStudy,
  SiteSettings,
  Testimonial,
  Faq,
  ContactSubmission
};
