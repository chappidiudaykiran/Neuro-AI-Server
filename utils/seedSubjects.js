require('dotenv').config()
const mongoose = require('mongoose')
const Subject = require('../models/Subject')
const connectDB = require('../config/db')
const dsaVideos = require('./dsa_videos.json')
const mlVideos = require('./ml_videos.json')
const cnVideos = require('./cn_videos.json')
const oopsVideos = require('./oops_videos.json')
const dmVideos = require('./dm_videos.json')
const flatVideos = require('./flat_videos.json')
const coaVideos = require('./coa_videos.json')
const osVideos = require('./os_videos.json')
const dbmsVideos = require('./dbms_videos.json')
const cVideos = require('./c_videos.json')
const mernVideos = require('./mern_videos.json')
const pythonVideos = require('./python_videos.json')
const engmathVideos = require('./engmath_videos.json')
const aptitudeVideos = require('./aptitude_videos.json')
const cdVideos = require('./cd_videos.json')
const dldVideos = require('./dld_videos.json')
const algoVideos = require('./algo_videos.json')

const generateVideos = (title) => [
	{ title: `${title} - Part 1: Introduction`, youtubeId: 'xo7XrRVxH8Y', duration: 45 },
	{ title: `${title} - Part 2: Deep Dive`, youtubeId: 'V42FBiohc6c', duration: 60 },
	{ title: `${title} - Part 3: Advanced Applications`, youtubeId: 'F_r0sJ1RqtA', duration: 55 }
]

const gateSubjects = [
	'Engineering Mathematics',
	'Discrete Mathematics',
	'Digital Logic',
	'Computer Organization & Architecture',
	'C Programming',
	'Data Structures',
	'Algorithms',
	'FLAT (Formal Languages and Automata Theory)',
	'Compiler Design',
	'Operating Systems',
	'Database Management Systems',
	'Computer Networks',
	'General Aptitude'
].map(name => ({
	name,
	shortName: name.substring(0, 10),
	description: `Complete, high-yield preparation module for ${name} specifically tailored to the GATE syllabus.`,
	category: 'GATE Prep',
	stressTag: 'high_stress',
	motivationBase: 2,
	videos: name === 'Discrete Mathematics' ? dmVideos :
            name === 'FLAT (Formal Languages and Automata Theory)' ? flatVideos :
            name === 'Computer Organization & Architecture' ? coaVideos :
            name === 'Computer Networks' ? cnVideos :
            name === 'Operating Systems' ? osVideos :
            name === 'Database Management Systems' ? dbmsVideos :
            name === 'Data Structures' ? dsaVideos :
            name === 'Engineering Mathematics' ? engmathVideos :
            name === 'General Aptitude' ? aptitudeVideos :
            name === 'Compiler Design' ? cdVideos :
            name === 'Digital Logic' ? dldVideos :
            name === 'Algorithms' ? algoVideos :
            name === 'C Programming' ? cVideos :
            generateVideos(name)
}))

const originalSubjects = [
	{
		name: 'Data Structures & Algorithms',
		shortName: 'DSA',
		description: 'Master arrays, linked lists, trees, graphs, sorting, searching and dynamic programming.',
		category: 'Programming',
		stressTag: 'medium_stress',
		motivationBase: 3,
		videos: dsaVideos,
	},
	{
		name: 'Object-Oriented Programming (OOPs)',
		shortName: 'OOPs',
		description: 'Core concepts of OOPs - Inheritance, Polymorphism, Encapsulation, and Abstraction.',
		category: 'CS Core',
		stressTag: 'low_stress',
		motivationBase: 4,
		videos: oopsVideos
	},
	{
		name: 'Operating Systems',
		shortName: 'OS',
		description: 'Learn process management, memory management, file systems, scheduling and synchronisation.',
		category: 'CS Core',
		stressTag: 'high_stress',
		motivationBase: 2,
		videos: osVideos,
	},
	{
		name: 'C Programming',
		shortName: 'C Prog',
		description: 'Beginner-friendly C programming - variables, loops, functions, arrays and pointers.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 4,
		videos: cVideos,
	},
	{
		name: 'Database Management Systems',
		shortName: 'DBMS',
		description: 'Covers relational algebra, SQL, normalisation, transactions and indexing.',
		category: 'CS Core',
		stressTag: 'medium_stress',
		motivationBase: 3,
		videos: dbmsVideos,
	},
	{
		name: 'Computer Networks',
		shortName: 'CN',
		description: 'TCP/IP, OSI model, routing, subnetting, HTTP, DNS, and network security basics.',
		category: 'CS Core',
		stressTag: 'high_stress',
		motivationBase: 2,
		videos: cnVideos
	},
	{
		name: 'Python Programming',
		shortName: 'Python',
		description: 'Python from scratch - data types, OOP, file handling, and popular libraries.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 5,
		videos: pythonVideos,
	},
	{
		name: 'MERN Stack Development',
		shortName: 'MERN Stack',
		description: 'Master MongoDB, Express.js, React, and Node.js to build full-stack web applications.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 5,
		videos: mernVideos,
	},
	{
		name: 'Machine Learning',
		shortName: 'ML',
		description: 'Core concepts of supervised / unsupervised learning, neural networks, and deep learning algorithms.',
		category: 'Programming',
		stressTag: 'high_stress',
		motivationBase: 1,
		videos: mlVideos
	}
]

const seed = async () => {
	await connectDB()
	await Subject.deleteMany({})
	const allSubjects = [...originalSubjects, ...gateSubjects]
	const inserted = await Subject.insertMany(allSubjects)
	console.log(`Seeded ${inserted.length} subjects into MongoDB natively!`)
	await mongoose.disconnect()
	process.exit(0)
}

seed().catch((err) => {
	console.error('Seed failed:', err)
	process.exit(1)
})
