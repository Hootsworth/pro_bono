// Pro Bono - Core Application Logic with Firebase
// Enhanced v2.0 - With semesters, subjects, and improved structure

// ===== Firestore Reference =====
const COURSES_COLLECTION = 'courses';

// ===== Available Semesters and Subjects =====
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'Web Development', 'Data Science', 'Machine Learning', 'Electronics', 'General'];

// Default sample data (used only for initial seeding)
const defaultCourses = [
  {
    id: 'course_1',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming, algorithms, and computational thinking.',
    color: '#FFD93D',
    semester: 'Sem 1',
    subject: 'Computer Science',
    instructor: 'Prof. Smith',
    credits: 4,
    videos: [
      { id: 'vid_1', title: 'What is Computer Science?', youtubeId: 'SzJ46YA_RaA' },
      { id: 'vid_2', title: 'Introduction to Algorithms', youtubeId: '8hly31xKli0' }
    ],
    questionPapers: [
      { id: 'qp_1', title: 'Mid-Term Exam 2024', driveLink: 'https://drive.google.com/drive/folders/example1' },
      { id: 'qp_2', title: 'Final Exam 2023', driveLink: 'https://drive.google.com/drive/folders/example2' }
    ],
    problemSets: [
      { id: 'ps_1', title: 'Week 1 - Basics', driveLink: 'https://drive.google.com/drive/folders/example3' },
      { id: 'ps_2', title: 'Week 2 - Loops', driveLink: 'https://drive.google.com/drive/folders/example4' }
    ]
  },
  {
    id: 'course_2',
    title: 'Data Structures & Algorithms',
    description: 'Master essential data structures like arrays, linked lists, trees, and graphs.',
    color: '#6BCB77',
    semester: 'Sem 2',
    subject: 'Computer Science',
    instructor: 'Prof. Johnson',
    credits: 4,
    videos: [
      { id: 'vid_3', title: 'Arrays Explained', youtubeId: 'QJNwK2uJyGs' }
    ],
    questionPapers: [
      { id: 'qp_3', title: 'Quiz Set 2024', driveLink: 'https://drive.google.com/drive/folders/example5' }
    ],
    problemSets: [
      { id: 'ps_3', title: 'Array Problems', driveLink: 'https://drive.google.com/drive/folders/example6' }
    ]
  },
  {
    id: 'course_3',
    title: 'Web Development Fundamentals',
    description: 'Build modern websites using HTML, CSS, and JavaScript from scratch.',
    color: '#FF6B9D',
    semester: 'Sem 3',
    subject: 'Web Development',
    instructor: 'Prof. Davis',
    credits: 3,
    videos: [
      { id: 'vid_4', title: 'HTML Crash Course', youtubeId: 'UB1O30fR-EE' },
      { id: 'vid_5', title: 'CSS Basics', youtubeId: 'yfoY53QXEnI' }
    ],
    questionPapers: [],
    problemSets: [
      { id: 'ps_4', title: 'Build a Portfolio', driveLink: 'https://drive.google.com/drive/folders/example7' }
    ]
  },
  {
    id: 'course_4',
    title: 'Calculus I',
    description: 'Explore limits, derivatives, and integrals in this foundational mathematics course.',
    color: '#A66CFF',
    semester: 'Sem 1',
    subject: 'Mathematics',
    instructor: 'Prof. Williams',
    credits: 4,
    videos: [],
    questionPapers: [
      { id: 'qp_4', title: 'Final Exam 2024', driveLink: 'https://drive.google.com/drive/folders/example8' }
    ],
    problemSets: [
      { id: 'ps_5', title: 'Limits Practice', driveLink: 'https://drive.google.com/drive/folders/example9' },
      { id: 'ps_6', title: 'Derivatives Practice', driveLink: 'https://drive.google.com/drive/folders/example10' }
    ]
  },
  {
    id: 'course_5',
    title: 'Machine Learning Basics',
    description: 'Introduction to supervised and unsupervised learning algorithms.',
    color: '#4ECDC4',
    semester: 'Sem 5',
    subject: 'Machine Learning',
    instructor: 'Prof. Chen',
    credits: 3,
    videos: [
      { id: 'vid_6', title: 'What is Machine Learning?', youtubeId: 'ukzFI9rgwfU' }
    ],
    questionPapers: [],
    problemSets: []
  }
];

// ===== Firestore Course Operations (Async) =====

async function getCoursesAsync() {
  try {
    const snapshot = await firebaseDb.collection(COURSES_COLLECTION).get();

    if (snapshot.empty) {
      // Seed with default courses
      console.log('Seeding default courses...');
      await seedDefaultCourses();
      return defaultCourses;
    }

    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function seedDefaultCourses() {
  const batch = firebaseDb.batch();
  defaultCourses.forEach(course => {
    const docRef = firebaseDb.collection(COURSES_COLLECTION).doc(course.id);
    batch.set(docRef, course);
  });
  await batch.commit();
}

async function getCourseByIdAsync(id) {
  try {
    const doc = await firebaseDb.collection(COURSES_COLLECTION).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

async function createCourseAsync(courseData) {
  try {
    const newCourse = {
      title: courseData.title,
      description: courseData.description,
      color: courseData.color || '#FFD93D',
      semester: courseData.semester || '',
      subject: courseData.subject || '',
      instructor: courseData.instructor || '',
      credits: courseData.credits || null,
      videos: [],
      questionPapers: [],
      problemSets: []
    };
    const docRef = await firebaseDb.collection(COURSES_COLLECTION).add(newCourse);
    return { id: docRef.id, ...newCourse };
  } catch (error) {
    console.error('Error creating course:', error);
    return null;
  }
}

async function updateCourseAsync(id, updates) {
  try {
    await firebaseDb.collection(COURSES_COLLECTION).doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating course:', error);
    return false;
  }
}

async function deleteCourseAsync(id) {
  try {
    await firebaseDb.collection(COURSES_COLLECTION).doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
}

// ===== Video Operations =====

async function addVideoAsync(courseId, videoData) {
  try {
    const course = await getCourseByIdAsync(courseId);
    if (course) {
      const newVideo = {
        id: 'vid_' + Date.now(),
        title: videoData.title,
        youtubeId: extractYouTubeId(videoData.youtubeUrl || videoData.youtubeId)
      };
      course.videos.push(newVideo);
      await updateCourseAsync(courseId, { videos: course.videos });
      return newVideo;
    }
    return null;
  } catch (error) {
    console.error('Error adding video:', error);
    return null;
  }
}

async function deleteVideoAsync(courseId, videoId) {
  try {
    const course = await getCourseByIdAsync(courseId);
    if (course) {
      course.videos = course.videos.filter(v => v.id !== videoId);
      await updateCourseAsync(courseId, { videos: course.videos });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

function extractYouTubeId(url) {
  if (!url) return '';

  // Clean the URL
  url = url.trim();

  // If it's already just an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Try to extract from various YouTube URL formats
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Shorts: youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Live: youtube.com/live/VIDEO_ID
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    // YouTube-nocookie: youtube-nocookie.com/embed/VIDEO_ID
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Mobile: m.youtube.com/watch?v=VIDEO_ID
    /(?:m\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matched, try to extract any 11-character sequence that looks like a video ID
  const fallbackMatch = url.match(/([a-zA-Z0-9_-]{11})/);
  if (fallbackMatch) {
    return fallbackMatch[1];
  }

  return url;
}

// ===== Resource Types =====
const RESOURCE_TYPES = {
  textbook: { label: 'Textbook / Reference Book', icon: '📚', color: '#6BCB77' },
  ppt: { label: 'PPT / Presentation', icon: '📊', color: '#4ECDC4' },
  flashcard: { label: 'Flashcards', icon: '🃏', color: '#FFD93D' },
  problemset: { label: 'Problem Set', icon: '📝', color: '#FF6B9D' },
  questionpaper: { label: 'Question Paper', icon: '📄', color: '#9B59B6' }
};

// ===== Resource Operations (Unified) =====

async function addResourceAsync(courseId, resourceData) {
  try {
    const course = await getCourseByIdAsync(courseId);
    if (course) {
      if (!course.resources) course.resources = [];

      const newResource = {
        id: 'res_' + Date.now(),
        type: resourceData.type,
        title: resourceData.title,
        driveLink: resourceData.driveLink || null,
        cards: resourceData.cards || null, // For flashcards
        createdAt: new Date().toISOString()
      };

      course.resources.push(newResource);
      await updateCourseAsync(courseId, { resources: course.resources });
      return newResource;
    }
    return null;
  } catch (error) {
    console.error('Error adding resource:', error);
    return null;
  }
}

async function deleteResourceAsync(courseId, resourceId) {
  try {
    const course = await getCourseByIdAsync(courseId);
    if (course && course.resources) {
      course.resources = course.resources.filter(r => r.id !== resourceId);
      await updateCourseAsync(courseId, { resources: course.resources });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting resource:', error);
    return false;
  }
}

// ===== CSV Parser for Flashcards =====

function parseFlashcardCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted values)
    const values = parseCSVLine(line);

    if (values.length >= 2) {
      const question = values[0].trim();
      const answer = values[1].trim();

      // Stop if both are empty
      if (!question && !answer) break;

      if (question && answer) {
        cards.push({
          id: 'card_' + Date.now() + '_' + i,
          question: question,
          answer: answer
        });
      }
    }
  }

  return cards;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

// ===== Legacy Functions (for backwards compatibility) =====
// These wrap the new resource system

async function addQuestionPaperAsync(courseId, paperData) {
  return addResourceAsync(courseId, {
    type: 'questionpaper',
    title: paperData.title,
    driveLink: paperData.driveLink
  });
}

async function deleteQuestionPaperAsync(courseId, paperId) {
  return deleteResourceAsync(courseId, paperId);
}

async function addProblemSetAsync(courseId, setData) {
  return addResourceAsync(courseId, {
    type: 'problemset',
    title: setData.title,
    driveLink: setData.driveLink
  });
}

async function deleteProblemSetAsync(courseId, setId) {
  return deleteResourceAsync(courseId, setId);
}

// ===== Firebase Authentication =====

async function loginWithEmail(email, password) {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  try {
    await firebaseAuth.signOut();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

function isAuthenticated() {
  return firebaseAuth.currentUser !== null;
}

function onAuthStateChanged(callback) {
  return firebaseAuth.onAuthStateChanged(callback);
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'admin.html';
    return false;
  }
  return true;
}

// ===== Utility Functions =====

function generateId(prefix) {
  return `${prefix}_${Date.now()}`;
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// ===== Legacy Sync Functions (for backwards compatibility during migration) =====
// These are wrapper functions that work with the existing sync code

let cachedCourses = null;

function getCourses() {
  // Return cached courses for sync access
  return cachedCourses || [];
}

function getCourseById(id) {
  const courses = getCourses();
  return courses.find(course => course.id === id);
}

// Load courses into cache on startup
async function initializeApp() {
  cachedCourses = await getCoursesAsync();
  return cachedCourses;
}

// ===== Role Management =====
const SUPER_ADMIN_EMAIL = 'adityapdixit6626@gmail.com';
const ADMINS_COLLECTION = 'admins';
const MAJORS_COLLECTION = 'majors';

// Check if current user is super admin
function isSuperAdmin() {
  const user = firebaseAuth.currentUser;
  return user && user.email === SUPER_ADMIN_EMAIL;
}

// Get current user's admin info
async function getCurrentAdminInfo() {
  const user = firebaseAuth.currentUser;
  if (!user) return null;

  // Super admin has full access
  if (user.email === SUPER_ADMIN_EMAIL) {
    return {
      email: user.email,
      role: 'superadmin',
      assignedMajor: null // Can access all majors
    };
  }

  // Check if user is an admin lite
  try {
    const snapshot = await firebaseDb.collection(ADMINS_COLLECTION)
      .where('email', '==', user.email)
      .get();

    if (!snapshot.empty) {
      const adminDoc = snapshot.docs[0];
      return { id: adminDoc.id, ...adminDoc.data() };
    }
  } catch (error) {
    console.error('Error getting admin info:', error);
  }

  return null;
}

// Check if user can edit a specific course
async function canEditCourse(course) {
  const adminInfo = await getCurrentAdminInfo();
  if (!adminInfo) return false;

  // Super admin can edit anything
  if (adminInfo.role === 'superadmin') return true;

  // Admin lite can only edit courses in their major
  if (adminInfo.role === 'adminlite') {
    return course.major === adminInfo.assignedMajor;
  }

  return false;
}

// ===== Majors CRUD (Super Admin Only) =====

async function getMajorsAsync() {
  try {
    const snapshot = await firebaseDb.collection(MAJORS_COLLECTION).orderBy('name').get();
    const majors = [];
    snapshot.forEach(doc => {
      majors.push({ id: doc.id, ...doc.data() });
    });
    return majors;
  } catch (error) {
    console.error('Error fetching majors:', error);
    return [];
  }
}

async function createMajorAsync(name) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can create majors');
    return null;
  }

  try {
    const docRef = await firebaseDb.collection(MAJORS_COLLECTION).add({
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: firebaseAuth.currentUser.email
    });
    return { id: docRef.id, name: name };
  } catch (error) {
    console.error('Error creating major:', error);
    return null;
  }
}

async function deleteMajorAsync(majorId) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can delete majors');
    return false;
  }

  try {
    await firebaseDb.collection(MAJORS_COLLECTION).doc(majorId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting major:', error);
    return false;
  }
}

// ===== Subjects CRUD (Super Admin Only) =====
const SUBJECTS_COLLECTION = 'subjects';

async function getSubjectsAsync() {
  try {
    const snapshot = await firebaseDb.collection(SUBJECTS_COLLECTION).orderBy('name').get();
    const subjects = [];
    snapshot.forEach(doc => {
      subjects.push({ id: doc.id, ...doc.data() });
    });
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

async function createSubjectAsync(name) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can create subjects');
    return null;
  }

  try {
    const docRef = await firebaseDb.collection(SUBJECTS_COLLECTION).add({
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: firebaseAuth.currentUser.email
    });
    return { id: docRef.id, name: name };
  } catch (error) {
    console.error('Error creating subject:', error);
    return null;
  }
}

async function deleteSubjectAsync(subjectId) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can delete subjects');
    return false;
  }

  try {
    await firebaseDb.collection(SUBJECTS_COLLECTION).doc(subjectId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    return false;
  }
}

// ===== Admin Lite Management (Super Admin Only) =====

async function getAdminLitesAsync() {
  try {
    const snapshot = await firebaseDb.collection(ADMINS_COLLECTION)
      .where('role', '==', 'adminlite')
      .get();
    const admins = [];
    snapshot.forEach(doc => {
      admins.push({ id: doc.id, ...doc.data() });
    });
    return admins;
  } catch (error) {
    console.error('Error fetching admin lites:', error);
    return [];
  }
}

async function createAdminLiteAsync(email, assignedMajor) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can create admin lites');
    return null;
  }

  try {
    const docRef = await firebaseDb.collection(ADMINS_COLLECTION).add({
      email: email,
      role: 'adminlite',
      assignedMajor: assignedMajor,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, email, role: 'adminlite', assignedMajor };
  } catch (error) {
    console.error('Error creating admin lite:', error);
    return null;
  }
}

async function deleteAdminLiteAsync(adminId) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can delete admin lites');
    return false;
  }

  try {
    await firebaseDb.collection(ADMINS_COLLECTION).doc(adminId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting admin lite:', error);
    return false;
  }
}

// ===== Get Courses Filtered by Major (for Admin Lite) =====

async function getCoursesForAdminAsync() {
  const adminInfo = await getCurrentAdminInfo();
  if (!adminInfo) return [];

  // Super admin sees all
  if (adminInfo.role === 'superadmin') {
    return await getCoursesAsync();
  }

  // Admin lite sees only their major
  try {
    const snapshot = await firebaseDb.collection(COURSES_COLLECTION)
      .where('major', '==', adminInfo.assignedMajor)
      .get();

    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error('Error fetching courses for admin:', error);
    return [];
  }
}

// ===== Universities CRUD =====
const UNIVERSITIES_COLLECTION = 'universities';

async function getUniversitiesAsync() {
  try {
    const snapshot = await firebaseDb.collection(UNIVERSITIES_COLLECTION).orderBy('name').get();
    const universities = [];
    snapshot.forEach(doc => {
      universities.push({ id: doc.id, ...doc.data() });
    });
    return universities;
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
}

async function createUniversityAsync(name, shortCode) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can create universities');
    return null;
  }

  try {
    const docRef = await firebaseDb.collection(UNIVERSITIES_COLLECTION).add({
      name: name,
      shortCode: shortCode || name.substring(0, 3).toUpperCase(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: firebaseAuth.currentUser.email
    });
    return { id: docRef.id, name: name, shortCode: shortCode };
  } catch (error) {
    console.error('Error creating university:', error);
    return null;
  }
}

async function deleteUniversityAsync(universityId) {
  if (!isSuperAdmin()) {
    console.error('Only super admin can delete universities');
    return false;
  }

  try {
    await firebaseDb.collection(UNIVERSITIES_COLLECTION).doc(universityId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting university:', error);
    return false;
  }
}

// ===== Timetables CRUD =====
const TIMETABLES_COLLECTION = 'timetables';

async function getTimetableAsync(universityId, semester, major) {
  try {
    let query = firebaseDb.collection(TIMETABLES_COLLECTION)
      .where('universityId', '==', universityId);

    if (semester) query = query.where('semester', '==', semester);
    if (major) query = query.where('major', '==', major);

    const snapshot = await query.get();
    const timetables = [];
    snapshot.forEach(doc => {
      timetables.push({ id: doc.id, ...doc.data() });
    });
    return timetables;
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return [];
  }
}

async function saveTimetableAsync(timetableData) {
  try {
    if (timetableData.id) {
      // Update existing
      await firebaseDb.collection(TIMETABLES_COLLECTION).doc(timetableData.id).update({
        ...timetableData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return timetableData;
    } else {
      // Create new
      const docRef = await firebaseDb.collection(TIMETABLES_COLLECTION).add({
        ...timetableData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: firebaseAuth.currentUser?.email || 'unknown'
      });
      return { id: docRef.id, ...timetableData };
    }
  } catch (error) {
    console.error('Error saving timetable:', error);
    return null;
  }
}

async function deleteTimetableAsync(timetableId) {
  try {
    await firebaseDb.collection(TIMETABLES_COLLECTION).doc(timetableId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return false;
  }
}

// ===== Academic Events CRUD =====
const EVENTS_COLLECTION = 'academicEvents';

const EVENT_TYPES = {
  internal: { label: 'Internal Assessment', color: '#FF6B9D', icon: '📝' },
  final: { label: 'Final Exam', color: '#FF6B6B', icon: '🎓' },
  holiday: { label: 'Holiday', color: '#6BCB77', icon: '🎉' },
  event: { label: 'Event', color: '#4ECDC4', icon: '📅' },
  deadline: { label: 'Deadline', color: '#FFD93D', icon: '⏰' }
};

async function getAcademicEventsAsync(universityId) {
  try {
    const snapshot = await firebaseDb.collection(EVENTS_COLLECTION)
      .where('universityId', '==', universityId)
      .orderBy('startDate')
      .get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (error) {
    console.error('Error fetching academic events:', error);
    return [];
  }
}

async function addAcademicEventAsync(eventData) {
  try {
    const docRef = await firebaseDb.collection(EVENTS_COLLECTION).add({
      ...eventData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: firebaseAuth.currentUser?.email || 'unknown'
    });
    return { id: docRef.id, ...eventData };
  } catch (error) {
    console.error('Error adding academic event:', error);
    return null;
  }
}

async function updateAcademicEventAsync(eventId, eventData) {
  try {
    await firebaseDb.collection(EVENTS_COLLECTION).doc(eventId).update({
      ...eventData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating academic event:', error);
    return false;
  }
}

async function deleteAcademicEventAsync(eventId) {
  try {
    await firebaseDb.collection(EVENTS_COLLECTION).doc(eventId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting academic event:', error);
    return false;
  }
}

// ===== Utility: Get Selected University from LocalStorage =====
function getSelectedUniversity() {
  return localStorage.getItem('selectedUniversity') || null;
}

function setSelectedUniversity(universityId) {
  localStorage.setItem('selectedUniversity', universityId);
}
