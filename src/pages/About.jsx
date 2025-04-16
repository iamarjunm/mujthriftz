import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiUsers, FiShoppingCart, FiDollarSign, FiHome } from 'react-icons/fi';
import { FaUniversity, FaBrain, FaHandsHelping } from 'react-icons/fa';
import { GiBrainstorm } from 'react-icons/gi';

const About = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  const founders = [
    {
      name: "Arjun Malhotra",
      role: "Co-Founder & Tech Lead",
      bio: "Full-stack wizard who turns coffee into code. Handles all the backend magic and database sorcery.",
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/iamarjunm",
        linkedin: "https://www.linkedin.com/in/arjun-malhotra-a90325217/",
        instagram: "https://www.instagram.com/iamarjun.m"
      }
    },
    {
      name: "S Kaushik Rao",
      role: "Co-Founder & Product Designer",
      bio: "UI/UX enthusiast who believes good design should be felt, not seen. Makes everything pretty and functional.",
      avatar: "🎨",
      social: {
        github: "https://github.com/SKaushikRao",
        linkedin: "https://www.linkedin.com/in/s-kaushik-rao-33336a289/",
        instagram: "https://www.instagram.com/cow_chick/"
      }
    }
  ];

  const milestones = [
    { 
      year: "2023", 
      event: "The Frustration", 
      icon: <FaBrain className="text-3xl" />,
      description: "Arjun needed a textbook, Kaushik needed to sell his old one. Neither knew about each other's needs. The spark was born."
    },
    { 
      year: "2025", 
      event: "PBL Project", 
      icon: <GiBrainstorm className="text-3xl" />,
      description: "Developed the initial prototype as part of our PBL (Project-Based Learning) initiative."
    },
    { 
      year: "Now", 
      event: "MUJ Thriftz", 
      icon: <FaUniversity className="text-3xl" />,
      description: "Helping students buy, sell, and connect across campus with plans to expand to other universities."
    }
  ];

  const features = [
    {
      icon: <FiShoppingCart className="text-4xl" />,
      title: "Buy & Sell",
      description: "Textbooks, electronics, furniture - if it's legal, you can trade it"
    },
    {
      icon: <FiDollarSign className="text-4xl" />,
      title: "Rent Stuff",
      description: "Need something temporarily? Rent from fellow students"
    },
    {
      icon: <FiHome className="text-4xl" />,
      title: "Roommate Finder",
      description: "No more random roommate roulette - find your perfect match"
    },
    {
      icon: <FaHandsHelping className="text-4xl" />,
      title: "Community Help",
      description: "Request items you need or offer services to others"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6"
          >
            Our Story
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            How two frustrated MUJ students built the campus marketplace they wished existed
          </motion.p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              The Problem We Faced
            </h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600">
                As 2nd year CSE (AI/ML) students at MUJ, <span className="font-bold">Arjun</span> and <span className="font-bold">Kaushik</span> kept running into the same frustrations:
              </p>
            </div>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <motion.div variants={item} className="bg-gray-50 p-6 rounded-xl">
              <div className="text-5xl mb-4">🤦‍♂️</div>
              <h3 className="text-xl font-bold mb-2">Wasted Resources</h3>
              <p className="text-gray-600">
                "I needed a textbook for one semester while my friend had it collecting dust - but we never knew!"
              </p>
            </motion.div>
            
            <motion.div variants={item} className="bg-gray-50 p-6 rounded-xl">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-2">Unnecessary Spending</h3>
              <p className="text-gray-600">
                "Why buy new lab equipment when seniors have barely used sets sitting in their rooms?"
              </p>
            </motion.div>
            
            <motion.div variants={item} className="bg-gray-50 p-6 rounded-xl">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">Roommate Roulette</h3>
              <p className="text-gray-600">
                "Getting matched with random roommates led to so many awkward situations"
              </p>
            </motion.div>
            
            <motion.div variants={item} className="bg-gray-50 p-6 rounded-xl">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold mb-2">Campus Waste</h3>
              <p className="text-gray-600">
                "Seeing perfectly good furniture being thrown out during hostel moves broke our hearts"
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center"
          >
            <h3 className="text-2xl font-bold mb-4">The "Aha!" Moment</h3>
            <p className="text-lg">
              "What if there was <span className="font-bold">one platform</span> where MUJ students could <span className="font-bold">buy, sell, lend, find roommates,</span> and <span className="font-bold">reduce waste</span> - all while building a stronger campus community?"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              The Crazy Duo Behind It
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Two 20-year-olds who code by night and attend ML lectures by day
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {founders.map((founder, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-8xl mb-4">{founder.avatar}</div>
                  <h3 className="text-2xl font-bold">{founder.name}</h3>
                  <p className="text-purple-600 font-medium mb-4">{founder.role}</p>
                  <p className="text-gray-600 mb-6">{founder.bio}</p>
                  <div className="flex gap-4">
                    <a href={founder.social.github} className="text-gray-500 hover:text-gray-900 transition-colors">
                      <FiGithub className="text-xl" />
                    </a>
                    <a href={founder.social.linkedin} className="text-gray-500 hover:text-blue-600 transition-colors">
                      <FiLinkedin className="text-xl" />
                    </a>
                    <a href={founder.social.instagram} className="text-gray-500 hover:text-blue-400 transition-colors">
                      <FiInstagram className="text-xl" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Our Journey
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-blue-500 transform -translate-x-1/2"></div>
            
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'pr-8 md:pr-16' : 'pl-8 md:pl-16'}`}>
                    <div className="bg-gray-50 rounded-xl p-6 relative">
                      {/* Dot on timeline */}
                      <div className={`absolute top-6 w-4 h-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 ${index % 2 === 0 ? '-right-8 md:-right-8' : '-left-8 md:-left-8'}`}></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-purple-600">
                          {milestone.icon}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">{milestone.year}</span>
                          <h3 className="text-xl font-bold">{milestone.event}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Why MUJ Thriftz?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything we built because we needed it ourselves
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-purple-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
            <p className="text-lg mb-8 opacity-90">
              Be part of MUJ's sustainable marketplace revolution
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/signup"
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
              >
                Sign Up Now
              </a>
              <a
                href="/products"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
              >
                Browse Listings
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;