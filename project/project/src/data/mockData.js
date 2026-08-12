export const seedClubs = [
  { id: "c1", name: "Coding Club", category: "Technical", desc: "Competitive programming, hackathons and open-source sprints.", members: 184, created: "Aug 12, 2023", coordinator: "Dr. Anil Mehta" },
  { id: "c2", name: "Robotics Society", category: "Technical", desc: "Autonomous systems, embedded builds and robo-wars.", members: 132, created: "Sep 2, 2023", coordinator: "Prof. Leela Rao" },
  { id: "c3", name: "Debate Union", category: "Literary", desc: "Parliamentary debate, MUN and public speaking labs.", members: 96, created: "Nov 20, 2022", coordinator: "Ms. Farah Khan" },
  { id: "c4", name: "Design Guild", category: "Creative", desc: "Product design, illustration and campus branding.", members: 143, created: "Jan 15, 2024", coordinator: "Mr. Rohit Sen" },
  { id: "c5", name: "Music Collective", category: "Cultural", desc: "Bands, a cappella and the annual campus unplugged night.", members: 121, created: "Feb 8, 2023", coordinator: "Ms. Ira Dutta" },
  { id: "c6", name: "Sports Council", category: "Sports", desc: "Inter-college tournaments and fitness programmes.", members: 210, created: "Jun 18, 2021", coordinator: "Coach Manoj Yadav" },
  { id: "c7", name: "Entrepreneurship Cell", category: "Business", desc: "Startup mentoring, pitch nights and innovation challenges.", members: 158, created: "Mar 4, 2023", coordinator: "Prof. Rakesh Deshmukh" },
  { id: "c8", name: "NSS", category: "Community", desc: "Community service, blood donation drives and tree plantation.", members: 226, created: "Jul 22, 2022", coordinator: "Prof. Sunita Patil" },
];

export const seedEvents = [
  { id: "e1", name: "Campus Unplugged", club: "Music Collective", desc: "Acoustic night featuring twelve student acts.", date: "2026-07-12", venue: "Open Amphitheatre", regCount: 574, regCap: 600, status: "Completed" },
  { id: "e2", name: "MUN Conference", club: "Debate Union", desc: "Three-committee model UN with visiting delegates.", date: "2026-06-28", venue: "Seminar Wing", regCount: 187, regCap: 200, status: "Completed" },
  { id: "e3", name: "HackCampus 24H", club: "Coding Club", desc: "Overnight build sprint with mentors from industry.", date: "2026-08-14", venue: "Innovation Hall", regCount: 268, regCap: 300, status: "Upcoming" },
  { id: "e4", name: "RoboWars Finals", club: "Robotics Society", desc: "Combat robotics championship, open to all departments.", date: "2026-08-22", venue: "Arena Block C", regCount: 312, regCap: 400, status: "Upcoming" },
  { id: "e5", name: "Design Sprint Week", club: "Design Guild", desc: "Five-day product design intensive with live critique.", date: "2026-07-30", venue: "Studio 2", regCount: 118, regCap: 120, status: "Ongoing" },
  { id: "e6", name: "Startup Pitch Night", club: "Entrepreneurship Cell", desc: "Ten teams pitch to a panel of angel investors.", date: "2026-09-05", venue: "Auditorium A", regCount: 54, regCap: 150, status: "Upcoming" },
  { id: "e7", name: "Inter-College Athletics Meet", club: "Sports Council", desc: "Track and field events against six visiting colleges.", date: "2026-09-12", venue: "Sports Arena", regCount: 145, regCap: 300, status: "Upcoming" },
  { id: "e8", name: "Community Blood Donation Camp", club: "NSS", desc: "Campus-wide donation drive in partnership with City Hospital.", date: "2026-08-11", venue: "Health Centre", regCount: 83, regCap: 150, status: "Ongoing" },
];

export const seedDrives = [
  { id: "d1", company: "Orbit Analytics", role: "Data Analyst Intern", desc: "Work with the analytics team on dashboards and reporting pipelines for enterprise clients.", package: "₹45k / month", location: "Hyderabad", deadline: "2026-08-12", applicants: 212, status: "Open", eligibility: "CGPA 7.0+, no active backlogs" },
  { id: "d2", company: "Vertex Motors", role: "Design Engineer", desc: "Design and validate mechanical components for next-generation electric vehicles.", package: "₹11 LPA", location: "Pune", deadline: "2026-09-01", applicants: 64, status: "Upcoming", eligibility: "Mechanical/Automobile branch, CGPA 7.5+" },
  { id: "d3", company: "Fintrail Capital", role: "Business Analyst", desc: "Support portfolio strategy with market research and financial modelling.", package: "₹14 LPA", location: "Mumbai", deadline: "2026-07-30", applicants: 96, status: "Closed", eligibility: "Any branch, CGPA 8.0+" },
  { id: "d4", company: "Skyline Infra", role: "Site Engineer Trainee", desc: "On-site execution and quality checks for large-scale infrastructure projects.", package: "₹6.5 LPA", location: "Chennai", deadline: "2026-08-28", applicants: 41, status: "Open", eligibility: "Civil branch, CGPA 6.5+" },
  { id: "d5", company: "Nimbus Labs", role: "SDE Intern", desc: "Build and ship features for a cloud-native SaaS platform alongside senior engineers.", package: "₹50k / month", location: "Bengaluru", deadline: "2026-08-05", applicants: 77, status: "Upcoming", eligibility: "CS/IT branch, CGPA 7.5+, no active backlogs" },
  { id: "d6", company: "Cascade Systems", role: "Cloud Support Engineer", desc: "Troubleshoot production incidents and support enterprise cloud customers.", package: "₹9.5 LPA", location: "Noida", deadline: "2026-08-20", applicants: 58, status: "Open", eligibility: "CS/IT/ECE branch, CGPA 7.0+" },
  { id: "d7", company: "BrightPath Retail", role: "Supply Chain Analyst", desc: "Optimize inventory and logistics workflows across regional warehouses.", package: "₹8 LPA", location: "Gurugram", deadline: "2026-09-10", applicants: 33, status: "Upcoming", eligibility: "Any branch, CGPA 6.5+" },
  { id: "d8", company: "Quanta Biotech", role: "Research Associate", desc: "Assist ongoing lab research in protein engineering and assay development.", package: "₹10.5 LPA", location: "Ahmedabad", deadline: "2026-08-15", applicants: 27, status: "Open", eligibility: "Biotech/Chemical branch, CGPA 7.5+" },
  { id: "d9", company: "Lumen Studios", role: "UI/UX Design Intern", desc: "Craft interfaces and motion prototypes for consumer mobile apps.", package: "₹30k / month", location: "Remote", deadline: "2026-08-22", applicants: 89, status: "Open", eligibility: "Design/CS branch, portfolio required" },
  { id: "d10", company: "Northgate Bank", role: "Credit Risk Trainee", desc: "Support credit underwriting and risk assessment for retail lending.", package: "₹12 LPA", location: "Kolkata", deadline: "2026-07-25", applicants: 118, status: "Closed", eligibility: "Any branch, CGPA 7.0+, no active backlogs" },
  { id: "d11", company: "Ferrotech Industries", role: "Production Engineer", desc: "Oversee shop-floor production planning and process improvement.", package: "₹7.5 LPA", location: "Coimbatore", deadline: "2026-09-05", applicants: 22, status: "Upcoming", eligibility: "Mechanical/Production branch, CGPA 6.5+" },
  { id: "d12", company: "Clearwave Telecom", role: "Network Engineer Intern", desc: "Support network operations and help roll out 5G infrastructure upgrades.", package: "₹35k / month", location: "Hyderabad", deadline: "2026-08-18", applicants: 46, status: "Open", eligibility: "ECE/CS branch, CGPA 7.0+" },
];

// Status pills cycle in this order when clicked on the Placements grid.
export const DRIVE_STATUS_CYCLE = ["Open", "Upcoming", "Closed"];

export const seedNotifications = [
  { id: "n1", title: "Nimbus Labs drive tomorrow", message: "Shortlisted students must report to Auditorium A by 8:30 AM with two resume copies.", audience: "Final year", channel: "push", date: "Aug 5, 2026", reads: 412, status: "Sent" },
  { id: "n2", title: "Club budget forms due", message: "All club coordinators must submit the quarterly budget form on the portal.", audience: "Club members", channel: "email", date: "Aug 4, 2026", reads: 168, status: "Sent" },
  { id: "n3", title: "HackCampus team registration closing", message: "Last day to register your team for HackCampus 24H is August 10.", audience: "All students", channel: "in-app", date: "Aug 8, 2026", reads: 0, status: "Scheduled" },
  { id: "n4", title: "Semester fee reminder", message: "Fee payment window closes on August 18. Late fee applies afterwards.", audience: "All students", channel: "email", date: "Aug 12, 2026", reads: 0, status: "Scheduled" },
  { id: "n5", title: "Faculty review meeting", message: "Department heads to meet in the seminar wing at 3 PM.", audience: "Faculty", channel: "in-app", date: "Aug 3, 2026", reads: 0, status: "Draft" },
];

// Shared student directory used to populate "registered students" and
// "club members" rosters on demand (keeps every club/event roster looking
// distinct without needing to hand-author hundreds of records).
export const seedStudents = [
  { name: "Rohan Patel", rollNo: "2024005", department: "Business", year: "1st year" },
  { name: "Ananya Chopra", rollNo: "2023006", department: "Design", year: "2nd year" },
  { name: "Ishan Pillai", rollNo: "2022007", department: "Computer Science", year: "3rd year" },
  { name: "Nisha Iyer", rollNo: "2021008", department: "Electronics", year: "4th year" },
  { name: "Vikram Bose", rollNo: "2024009", department: "Mechanical", year: "1st year" },
  { name: "Aarav Sharma", rollNo: "2024010", department: "Computer Science", year: "1st year" },
  { name: "Diya Reddy", rollNo: "2023011", department: "Electronics", year: "2nd year" },
  { name: "Kabir Gupta", rollNo: "2022012", department: "Mechanical", year: "3rd year" },
  { name: "Meera Rao", rollNo: "2021013", department: "Civil", year: "4th year" },
  { name: "Aditya Nair", rollNo: "2024014", department: "Computer Science", year: "1st year" },
  { name: "Sneha Joshi", rollNo: "2023015", department: "Design", year: "2nd year" },
  { name: "Arjun Verma", rollNo: "2022016", department: "Business", year: "3rd year" },
  { name: "Kavya Menon", rollNo: "2021017", department: "Electronics", year: "4th year" },
  { name: "Rahul Kapoor", rollNo: "2024018", department: "Mechanical", year: "1st year" },
  { name: "Priya Desai", rollNo: "2023019", department: "Civil", year: "2nd year" },
  { name: "Yash Malhotra", rollNo: "2022020", department: "Computer Science", year: "3rd year" },
];

// Notification-bell inbox preview (the "3 new notifications" popover).
export const seedInboxAlerts = [
  { id: "a1", label: "Learning request", detail: "Ananya Chopra requested access to the Data Science track.", time: "10m ago" },
  { id: "a2", label: "Learning request", detail: "Kabir Gupta requested access to the UI/UX mentorship track.", time: "45m ago" },
  { id: "a3", label: "Event update", detail: "HackCampus 24H registrations crossed 250 students.", time: "2h ago" },
];

export const CATEGORY_COLORS = {
  Technical: "bg-blue-50 text-blue-700",
  Literary: "bg-amber-50 text-amber-700",
  Creative: "bg-pink-50 text-pink-700",
  Cultural: "bg-purple-50 text-purple-700",
  Sports: "bg-emerald-50 text-emerald-700",
  Business: "bg-cyan-50 text-cyan-700",
  Community: "bg-lime-50 text-lime-700",
};

export const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700",
  Upcoming: "bg-amber-50 text-amber-700",
  Closed: "bg-slate-100 text-slate-500",
  Completed: "bg-slate-100 text-slate-500",
  Ongoing: "bg-blue-50 text-blue-700",
  Sent: "bg-emerald-50 text-emerald-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Draft: "bg-slate-100 text-slate-500",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-600",
};

export const seedMaterials = [
  { id: "m1", title: "Database Management Systems Notes", subject: "DBMS", semester: "5", fileName: "dbms-notes.pdf", uploaded: "2026-07-02" },
  { id: "m2", title: "React & Modern Frontend Guide", subject: "React", semester: "5", fileName: "react-guide.pdf", uploaded: "2026-07-10" },
  { id: "m3", title: "Core Java Handbook", subject: "Java", semester: "5", fileName: "java-notes.pdf", uploaded: "2026-06-18" },
  { id: "m4", title: "Operating Systems Concepts", subject: "Operating Systems", semester: "4", fileName: "os-concepts.pdf", uploaded: "2026-05-22" },
  { id: "m5", title: "Data Structures Cheat Sheet", subject: "DSA", semester: "3", fileName: "dsa-cheatsheet.pdf", uploaded: "2026-04-30" },
  { id: "m6", title: "Computer Networks Lab Manual", subject: "Computer Networks", semester: "5", fileName: "cn-lab-manual.pdf", uploaded: "2026-07-25" },
];

export const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"];

// Kept in sync with the "Learning request" inbox alerts above — approving or
// rejecting a request here is what those alerts refer to.
export const seedLearningRequests = [
  { id: "lr1", student: "Ananya Chopra", rollNo: "2023006", subject: "Data Science", requestedOn: "2026-08-08", status: "Pending" },
  { id: "lr2", student: "Kabir Gupta", rollNo: "2022012", subject: "UI/UX Mentorship", requestedOn: "2026-08-08", status: "Pending" },
  { id: "lr3", student: "Rahul Kapoor", rollNo: "2024018", subject: "React", requestedOn: "2026-08-05", status: "Approved" },
  { id: "lr4", student: "Priya Desai", rollNo: "2023019", subject: "Java", requestedOn: "2026-08-03", status: "Approved" },
  { id: "lr5", student: "Yash Malhotra", rollNo: "2022020", subject: "DBMS", requestedOn: "2026-08-01", status: "Rejected" },
  { id: "lr6", student: "Meera Rao", rollNo: "2021013", subject: "Cloud Computing", requestedOn: "2026-07-29", status: "Pending" },
];
