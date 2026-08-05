/**
 * utils/seeder.js
 *
 * Seeds the database with realistic test data for development.
 * Run with: npm run seed
 * Destroy with: npm run seed -- --destroy
 */

require('dotenv').config();
const mongoose     = require('mongoose');
const bcrypt       = require('bcryptjs');
const User         = require('../models/User.model');
const ChildProfile = require('../models/ChildProfile.model');
const Artwork      = require('../models/Artwork.model');
const ForumPost    = require('../models/ForumPost.model');

// ── Seed Data ────────────────────────────────────────────────
const users = [
  {
    firstName: 'Admin',
    lastName : 'User',
    username : 'admin',
    email    : process.env.ADMIN_EMAIL || 'admin@artshowcase.com',
    password : process.env.ADMIN_PASSWORD || 'AdminPass@123',
    role     : 'admin',
    emailVerified: true,
  },
  {
    firstName: 'Sarah',
    lastName : 'Johnson',
    username : 'sarah_j',
    email    : 'sarah@example.com',
    password : 'Password@123',
    role     : 'parent',
    bio      : 'Mom of two creative kids. Love watercolour and craft!',
    emailVerified: true,
  },
  {
    firstName: 'Michael',
    lastName : 'Chen',
    username : 'mike_chen',
    email    : 'mike@example.com',
    password : 'Password@123',
    role     : 'parent',
    bio      : 'Dad of a little artist. Passionate about child development.',
    emailVerified: true,
  },
  {
    firstName: 'Priya',
    lastName : 'Patel',
    username : 'priya_p',
    email    : 'priya@example.com',
    password : 'Password@123',
    role     : 'parent',
    bio      : 'Art teacher and parent. Spreading creativity one canvas at a time!',
    emailVerified: true,
  },
];

// ── Artworks (sample URLs from Unsplash children art) ────────
const sampleArtworkUrls = [
  'https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?w=800',
  'https://images.unsplash.com/photo-1562780814-a30a81b851dc?w=800',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
  'https://images.unsplash.com/photo-1501166222995-ff31c7e93cef?w=800',
];

// ── Runner ────────────────────────────────────────────────────
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await ChildProfile.deleteMany();
    await Artwork.deleteMany();
    await ForumPost.deleteMany();
    console.log('🗑️  Existing data cleared');

    // Create users
    const createdUsers = await User.insertMany(users);
    const [adminUser, sarah, mike, priya] = createdUsers;
    console.log(`👤 ${createdUsers.length} users seeded`);

    // Create child profiles
    const children = await ChildProfile.insertMany([
      {
        parent     : sarah._id,
        displayName: 'Emma',
        dateOfBirth: new Date('2016-03-15'),
        artInterests: ['painting', 'drawing'],
        bio        : 'I love drawing rainbows and flowers!',
        privacyLevel: 'public',
        consentGiven: true,
        consentDate : new Date(),
      },
      {
        parent     : sarah._id,
        displayName: 'Oliver',
        dateOfBirth: new Date('2019-07-20'),
        artInterests: ['craft', 'drawing'],
        bio        : 'Dinosaurs are my favourite thing to draw!',
        privacyLevel: 'community',
        consentGiven: true,
        consentDate : new Date(),
      },
      {
        parent     : mike._id,
        displayName: 'Lily',
        dateOfBirth: new Date('2014-11-05'),
        artInterests: ['digital', 'painting', 'mixed_media'],
        bio        : 'Future artist and graphic designer!',
        privacyLevel: 'public',
        consentGiven: true,
        consentDate : new Date(),
      },
      {
        parent     : priya._id,
        displayName: 'Arjun',
        dateOfBirth: new Date('2017-01-28'),
        artInterests: ['sculpture', 'craft'],
        bio        : 'I make things out of clay and recycled materials.',
        privacyLevel: 'community',
        consentGiven: true,
        consentDate : new Date(),
      },
    ]);
    console.log(`👶 ${children.length} child profiles seeded`);

    // Create artworks
    const [emma, oliver, lily, arjun] = children;
    const artworks = await Artwork.insertMany([
      {
        child : emma._id, parent: sarah._id,
        title : 'Rainbow Garden', description: 'A garden full of colourful flowers and a rainbow!',
        category: 'painting', medium: 'Watercolour',
        tags  : ['rainbow', 'flowers', 'nature'],
        images: {
          original : { url: sampleArtworkUrls[0], publicId: 'art-showcase/artworks/artwork_1' },
          medium   : { url: sampleArtworkUrls[0], publicId: 'art-showcase/artworks/artwork_1_md' },
          thumbnail: { url: sampleArtworkUrls[0], publicId: 'art-showcase/artworks/artwork_1_th' },
        },
        moderationStatus: 'approved',
        isPublished: true,
        isFeatured : true,
        likedBy    : [mike._id, priya._id],
        likeCount  : 2,
        childStory : 'I painted this after we visited the botanical garden!',
        creationDate: new Date('2026-07-15'),
      },
      {
        child : lily._id, parent: mike._id,
        title : 'Space Adventure', description: 'Astronaut exploring a colourful galaxy.',
        category: 'digital', medium: 'Digital art (tablet)',
        tags  : ['space', 'galaxy', 'astronaut'],
        images: {
          original : { url: sampleArtworkUrls[1], publicId: 'art-showcase/artworks/artwork_2' },
          medium   : { url: sampleArtworkUrls[1], publicId: 'art-showcase/artworks/artwork_2_md' },
          thumbnail: { url: sampleArtworkUrls[1], publicId: 'art-showcase/artworks/artwork_2_th' },
        },
        moderationStatus: 'approved',
        isPublished: true,
        likedBy    : [sarah._id],
        likeCount  : 1,
        childStory : 'I want to be an astronaut when I grow up!',
        creationDate: new Date('2026-07-20'),
      },
      {
        child : arjun._id, parent: priya._id,
        title : 'My Clay Dragon', description: 'Hand-sculpted dragon from air-dry clay.',
        category: 'sculpture', medium: 'Air-dry clay',
        tags  : ['dragon', 'sculpture', 'clay'],
        images: {
          original : { url: sampleArtworkUrls[2], publicId: 'art-showcase/artworks/artwork_3' },
          thumbnail: { url: sampleArtworkUrls[2], publicId: 'art-showcase/artworks/artwork_3_th' },
        },
        moderationStatus: 'approved',
        isPublished: true,
        childStory : 'It took me 3 days to make this!',
        creationDate: new Date('2026-07-25'),
      },
      {
        child : oliver._id, parent: sarah._id,
        title : 'T-Rex Attack!', description: 'A very scary T-Rex chasing tiny people.',
        category: 'drawing', medium: 'Crayons',
        tags  : ['dinosaur', 'trex', 'fun'],
        images: {
          original : { url: sampleArtworkUrls[3], publicId: 'art-showcase/artworks/artwork_4' },
          thumbnail: { url: sampleArtworkUrls[3], publicId: 'art-showcase/artworks/artwork_4_th' },
        },
        moderationStatus: 'pending',
        isPublished: false,
        childStory : 'RAWR! Dinosaurs are the coolest!',
        creationDate: new Date('2026-08-01'),
      },
    ]);
    console.log(`🎨 ${artworks.length} artworks seeded`);

    // Create forum posts
    await ForumPost.insertMany([
      {
        author  : sarah._id,
        title   : 'Best watercolour paints for 6-year-olds?',
        body    : 'Hi everyone! Emma has recently fallen in love with watercolours. Can anyone recommend child-safe, washable brands that produce vibrant colours? We\'ve tried a few supermarket brands but they look washed out. Prefer something that won\'t stain too badly!',
        category: 'materials_and_supplies',
        tags    : ['watercolour', 'paints', 'recommendations'],
        upvotedBy  : [mike._id, priya._id],
        upvoteCount: 2,
        commentCount: 3,
        moderationStatus: 'approved',
        lastActivityAt: new Date(),
      },
      {
        author  : priya._id,
        title   : 'How I turned screen time into art time — our iPad drawing journey',
        body    : 'As an art teacher, I was initially resistant to digital art for young children. But after watching my students thrive with tablets, I changed my mind. Here are the apps and techniques we use at home with Arjun...',
        category: 'art_techniques',
        tags    : ['digital-art', 'ipad', 'screen-time', 'tips'],
        upvotedBy  : [sarah._id, mike._id],
        upvoteCount: 2,
        isPinned: true,
        moderationStatus: 'approved',
        lastActivityAt: new Date(),
      },
      {
        author  : mike._id,
        title   : 'Monthly Showcase Challenge — July Theme: "NATURE"',
        body    : 'Welcome to our monthly community challenge! This month\'s theme is NATURE. Encourage your little ones to create art inspired by plants, animals, weather, or anything from the natural world. Upload by July 31st and vote for your favourites!',
        category: 'events_and_activities',
        tags    : ['challenge', 'monthly', 'nature'],
        isAnnouncement: true,
        moderationStatus: 'approved',
        commentCount: 5,
        lastActivityAt: new Date(),
      },
    ]);
    console.log('📝 Forum posts seeded');

    console.log('\n✅ Database seeded successfully!');
    console.log('────────────────────────────────────');
    console.log(`Admin email    : ${adminUser.email}`);
    console.log(`Admin password : ${process.env.ADMIN_PASSWORD || 'AdminPass@123'}`);
    console.log('────────────────────────────────────');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany();
    await ChildProfile.deleteMany();
    await Artwork.deleteMany();
    await ForumPost.deleteMany();
    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy error:', error);
    process.exit(1);
  }
};

process.argv[2] === '--destroy' ? destroyData() : importData();
