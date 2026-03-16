require('dotenv').config()
const mongoose = require('mongoose')
const Subject = require('../models/Subject')
const connectDB = require('../config/db')

const subjects = [
	{
		name: 'GATE Computer Science Preparation',
		shortName: 'GATE',
		description: 'Complete GATE CS preparation covering all key topics - algorithms, OS, networks, databases and more.',
		category: 'GATE Prep',
		stressTag: 'high_stress',
		motivationBase: 2,
		videos: [
			{ title: 'GATE CS 2025 - Full Syllabus Overview', youtubeId: 'xo7XrRVxH8Y', duration: 42 },
			{ title: 'Algorithms - Time Complexity Deep Dive', youtubeId: 'V42FBiohc6c', duration: 38 },
			{ title: 'Graph Theory for GATE', youtubeId: 'tWVWeAqZ0WU', duration: 55 },
			{ title: 'Dynamic Programming - GATE Questions', youtubeId: 'oBt53YbR9Kk', duration: 60 },
			{ title: 'GATE Previous Year Solutions', youtubeId: 'F_r0sJ1RqtA', duration: 48 },
		],
	},
	{
		name: 'Data Structures & Algorithms',
		shortName: 'DSA',
		description: 'Master arrays, linked lists, trees, graphs, sorting, searching and dynamic programming.',
		category: 'CS Core',
		stressTag: 'medium_stress',
		motivationBase: 3,
		videos: [
			{ title: 'Arrays & Linked Lists Fundamentals', youtubeId: 'RBSGKlAvoiM', duration: 45 },
			{ title: 'Binary Trees & BST', youtubeId: 'oSWTXtMglKE', duration: 38 },
			{ title: 'Graphs - BFS & DFS', youtubeId: 'tWVWeAqZ0WU', duration: 44 },
			{ title: 'Sorting Algorithms Visualised', youtubeId: 'kPRA0W1kECg', duration: 30 },
			{ title: 'Dynamic Programming - Patterns', youtubeId: 'oBt53YbR9Kk', duration: 56 },
		],
	},
	{
		name: 'Operating Systems',
		shortName: 'OS',
		description: 'Learn process management, memory management, file systems, scheduling and synchronisation.',
		category: 'CS Core',
		stressTag: 'high_stress',
		motivationBase: 2,
		videos: [
			{ title: 'OS Introduction - Processes & Threads', youtubeId: 'vBURTt97EkA', duration: 36 },
			{ title: 'CPU Scheduling Algorithms', youtubeId: 'EWkQl0n0w5M', duration: 42 },
			{ title: 'Memory Management & Paging', youtubeId: 'qdkxqs_pthc', duration: 50 },
			{ title: 'Deadlock - Detection & Prevention', youtubeId: 'UVo9mGARkhQ', duration: 38 },
			{ title: 'File Systems Explained', youtubeId: 'KN8YgJnShPM', duration: 33 },
		],
	},
	{
		name: 'C Programming',
		shortName: 'C Prog',
		description: 'Beginner-friendly C programming - variables, loops, functions, arrays and pointers.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 4,
		videos: [
			{ title: 'C Programming Full Course for Beginners', youtubeId: 'KJgsSFOSQv0', duration: 220 },
			{ title: 'Pointers in C - Complete Guide', youtubeId: 'zuegQmMdy8M', duration: 68 },
			{ title: 'Functions & Recursion in C', youtubeId: 'jQ0CBqe0oNk', duration: 44 },
			{ title: 'Arrays & Strings in C', youtubeId: 'Nfk2pBY7kGY', duration: 52 },
			{ title: 'File Handling in C', youtubeId: '8sOaQMUTgWo', duration: 35 },
		],
	},
	{
		name: 'Database Management Systems',
		shortName: 'DBMS',
		description: 'Covers relational algebra, SQL, normalisation, transactions and indexing.',
		category: 'CS Core',
		stressTag: 'medium_stress',
		motivationBase: 3,
		videos: [
			{ title: 'DBMS Full Course', youtubeId: 'dl00fOOYLOM', duration: 90 },
			{ title: 'SQL - Complete Tutorial', youtubeId: 'HXV3zeQKqGY', duration: 180 },
			{ title: 'Normalisation - 1NF 2NF 3NF', youtubeId: 'ABwD8IYByfk', duration: 40 },
			{ title: 'Transactions & ACID Properties', youtubeId: 'pomxJOFVcQs', duration: 35 },
			{ title: 'Indexing & B+ Trees', youtubeId: 'aZjYr87r1b8', duration: 44 },
		],
	},
	{
		name: 'Computer Networks',
		shortName: 'CN',
		description: 'TCP/IP, OSI model, routing, subnetting, HTTP, DNS, and network security basics.',
		category: 'CS Core',
		stressTag: 'high_stress',
		motivationBase: 2,
		videos: [
			{ title: 'Computer Networks Full Course', youtubeId: 'IPvYjXCsTg8', duration: 85 },
			{ title: 'OSI Model Explained', youtubeId: 'vv4y_uOneC0', duration: 32 },
			{ title: 'TCP/IP & Subnetting', youtubeId: 'EkNq4TrHP_U', duration: 55 },
			{ title: 'HTTP & HTTPS Deep Dive', youtubeId: '-a8LgieQZus', duration: 28 },
			{ title: 'DNS - How it Works', youtubeId: 'mpQZVYPuDGU', duration: 22 },
		],
	},
	{
		name: 'Python Programming',
		shortName: 'Python',
		description: 'Python from scratch - data types, OOP, file handling, and popular libraries.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 5,
		videos: [
			{ title: 'Python Full Course for Beginners', youtubeId: '_uQrJ0TkZlc', duration: 360 },
			{ title: 'OOP in Python', youtubeId: 'JeznW_7DlB0', duration: 62 },
			{ title: 'Python for Data Science', youtubeId: 'r-uOLxNrNk8', duration: 75 },
			{ title: 'File Handling & Exceptions', youtubeId: 'Uh2ebFW8OYM', duration: 30 },
			{ title: 'NumPy & Pandas Basics', youtubeId: 'vmEHCJofslg', duration: 58 },
		],
	},
	{
		name: 'Web Development (HTML CSS JS)',
		shortName: 'Web Dev',
		description: 'Build real websites from scratch - HTML structure, CSS styling, and JavaScript interactivity.',
		category: 'Programming',
		stressTag: 'low_stress',
		motivationBase: 5,
		videos: [
			{ title: 'HTML Full Course', youtubeId: 'mU6anWqZJcc', duration: 120 },
			{ title: 'CSS Full Course', youtubeId: 'wRNinF7YQqQ', duration: 132 },
			{ title: 'JavaScript Full Course', youtubeId: 'W6NZfCO5SIk', duration: 330 },
			{ title: 'Responsive Web Design', youtubeId: 'srvUrASNj0s', duration: 55 },
			{ title: 'DOM Manipulation in JS', youtubeId: 'y17RuWkWdn8', duration: 40 },
		],
	},
]

const seed = async () => {
	await connectDB()
	await Subject.deleteMany({})
	const inserted = await Subject.insertMany(subjects)
	console.log(`Seeded ${inserted.length} subjects into MongoDB`)
	await mongoose.disconnect()
	process.exit(0)
}

seed().catch((err) => {
	console.error('Seed failed:', err)
	process.exit(1)
})
