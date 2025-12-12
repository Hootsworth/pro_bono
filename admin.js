// Pro Bono - Admin Dashboard JavaScript with Firebase
// Enhanced v2.0 - With Role-Based Access Control

let currentAdminInfo = null;
let cachedMajors = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication with Firebase
    onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'admin.html';
            return;
        }

        // Get admin info
        currentAdminInfo = await getCurrentAdminInfo();

        if (!currentAdminInfo) {
            alert('You do not have admin access. Please apply for admin access.');
            await logoutUser();
            window.location.href = 'index.html';
            return;
        }

        // User is logged in and has admin access
        document.getElementById('userEmail').textContent = user.email;
        await initializeAdmin();
    });
});

async function initializeAdmin() {
    // Load majors
    cachedMajors = await getMajorsAsync();

    // Set role badge
    const roleBadge = document.getElementById('roleBadge');
    if (currentAdminInfo.role === 'superadmin') {
        roleBadge.textContent = '👑 Super Admin';
        roleBadge.style.background = 'var(--accent-yellow)';

        // Show super admin menu items
        document.getElementById('majorsNavItem').style.display = 'block';
        document.getElementById('subjectsNavItem').style.display = 'block';
        document.getElementById('universitiesNavItem').style.display = 'block';
        document.getElementById('adminsNavItem').style.display = 'block';
        document.getElementById('applicationsNavItem').style.display = 'block';
        document.getElementById('certCoursesNavItem').style.display = 'block';
    } else {
        roleBadge.textContent = '🛡️ Admin Lite';
        roleBadge.style.background = 'var(--accent-cyan)';

        // Show assigned major
        document.getElementById('assignedMajorInfo').style.display = 'block';
        document.getElementById('assignedMajorName').textContent = currentAdminInfo.assignedMajor || 'Not assigned';
    }

    // Render courses table
    await renderCoursesTable();

    // Hide loading, show content
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('coursesView').style.display = 'block';

    // Event Listeners
    setupEventListeners();

    // Populate major dropdowns
    populateMajorDropdowns();

    // Populate subject dropdowns
    await populateSubjectDropdowns();
}

// Populate subject dropdowns with data from Firestore
async function populateSubjectDropdowns() {
    const courseSubjectSelect = document.getElementById('courseSubject');
    if (!courseSubjectSelect) return;

    // Clear existing options except first
    courseSubjectSelect.innerHTML = '<option value="">Select Subject</option>';

    // Fetch subjects from Firestore
    const subjects = await getSubjectsAsync();

    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.name;
        option.textContent = subject.name;
        courseSubjectSelect.appendChild(option);
    });
}

function populateMajorDropdowns() {
    const courseMajorSelect = document.getElementById('courseMajor');
    const adminMajorSelect = document.getElementById('adminMajor');

    // Clear existing options except first
    courseMajorSelect.innerHTML = '<option value="">Select Major</option>';
    if (adminMajorSelect) {
        adminMajorSelect.innerHTML = '<option value="">Select Major</option>';
    }

    // For Admin Lite, only show their assigned major
    if (currentAdminInfo.role === 'adminlite') {
        const option = document.createElement('option');
        option.value = currentAdminInfo.assignedMajor;
        option.textContent = currentAdminInfo.assignedMajor;
        option.selected = true;
        courseMajorSelect.appendChild(option);
    } else {
        // Super admin sees all majors
        cachedMajors.forEach(major => {
            const option1 = document.createElement('option');
            option1.value = major.name;
            option1.textContent = major.name;
            courseMajorSelect.appendChild(option1);

            if (adminMajorSelect) {
                const option2 = document.createElement('option');
                option2.value = major.name;
                option2.textContent = major.name;
                adminMajorSelect.appendChild(option2);
            }
        });
    }
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await logoutUser();
        window.location.href = 'admin.html';
    });

    // Add Course Button
    document.getElementById('addCourseBtn').addEventListener('click', () => {
        openCourseModal();
    });

    // Course Modal
    document.getElementById('closeCourseModal').addEventListener('click', closeCourseModal);
    document.getElementById('cancelCourseBtn').addEventListener('click', closeCourseModal);
    document.getElementById('saveCourseBtn').addEventListener('click', saveCourse);

    // Color Options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Course Detail Modal
    document.getElementById('closeCourseDetailModal').addEventListener('click', closeCourseDetailModal);
    document.getElementById('closeCourseDetailBtn').addEventListener('click', closeCourseDetailModal);

    // Video Controls
    document.getElementById('addVideoBtn').addEventListener('click', () => toggleForm('videoForm', true));
    document.getElementById('cancelVideoBtn').addEventListener('click', () => toggleForm('videoForm', false));
    document.getElementById('saveVideoBtn').addEventListener('click', saveVideo);

    // Resource Controls (unified)
    document.getElementById('addResourceBtn').addEventListener('click', () => toggleResourceForm(true));

    // Delete Modal
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
            }
        });
    });

    // Super Admin only listeners
    if (currentAdminInfo.role === 'superadmin') {
        document.getElementById('addMajorBtn')?.addEventListener('click', openMajorModal);
        document.getElementById('addSubjectBtn')?.addEventListener('click', openSubjectModal);
        document.getElementById('addUniversityBtn')?.addEventListener('click', openUniversityModal);
        document.getElementById('addAdminLiteBtn')?.addEventListener('click', openAdminLiteModal);
    }

    // Timetable and Event buttons (all admins)
    document.getElementById('addTimetableBtn')?.addEventListener('click', () => openTimetableModal());
    document.getElementById('addEventBtn')?.addEventListener('click', () => openEventModal());

    // Filter change handlers
    document.getElementById('timetableUniversityFilter')?.addEventListener('change', renderTimetablesList);
    document.getElementById('timetableSemesterFilter')?.addEventListener('change', renderTimetablesList);
    document.getElementById('eventUniversityFilter')?.addEventListener('change', renderEventsList);
}

// ===== View Navigation =====
function showView(viewName) {
    // Hide all views
    document.getElementById('coursesView').style.display = 'none';
    document.getElementById('majorsView').style.display = 'none';
    document.getElementById('subjectsView').style.display = 'none';
    document.getElementById('universitiesView').style.display = 'none';
    document.getElementById('timetablesView').style.display = 'none';
    document.getElementById('eventsView').style.display = 'none';
    document.getElementById('adminsView').style.display = 'none';
    document.getElementById('applicationsView').style.display = 'none';
    document.getElementById('certCoursesView').style.display = 'none';

    // Remove active class from nav
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    // Show selected view
    document.getElementById(viewName + 'View').style.display = 'block';
    document.querySelector(`.sidebar-nav a[data-view="${viewName}"]`)?.classList.add('active');

    // Render content for the view
    if (viewName === 'majors') renderMajorsList();
    if (viewName === 'subjects') renderSubjectsList();
    if (viewName === 'universities') renderUniversitiesList();
    if (viewName === 'timetables') {
        populateUniversityDropdowns();
        renderTimetablesList();
    }
    if (viewName === 'events') {
        populateUniversityDropdowns();
        renderEventsList();
    }
    if (viewName === 'admins') renderAdminsList();
    if (viewName === 'applications') renderApplicationsList();
    if (viewName === 'certCourses') renderCertCoursesList();
}

// ===== Courses Table =====
async function renderCoursesTable() {
    const courses = await getCoursesForAdminAsync();
    const tableBody = document.getElementById('coursesTableBody');
    const emptyState = document.getElementById('coursesEmpty');
    const table = document.getElementById('coursesTable');

    if (courses.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    tableBody.innerHTML = courses.map(course => `
    <tr>
      <td><div style="width: 24px; height: 24px; background: ${course.color}; border: 2px solid #1A1A1A;"></div></td>
      <td>
        <strong>${escapeHtml(course.title)}</strong>
        ${course.major ? `<br><small class="badge badge-semester">${escapeHtml(course.major)}</small>` : ''}
        ${course.instructor ? `<br><small style="color: var(--text-secondary);">👤 ${escapeHtml(course.instructor)}</small>` : ''}
      </td>
      <td>${escapeHtml(course.semester || '-')}</td>
      <td>${escapeHtml(course.subject || '-')}</td>
      <td>${course.videos?.length || 0} / ${course.questionPapers?.length || 0} / ${course.problemSets?.length || 0}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-success" onclick="openCourseDetailModal('${course.id}')">Manage</button>
          <button class="btn" onclick="openCourseModal('${course.id}')">Edit</button>
          <button class="btn btn-danger" onclick="confirmDeleteCourse('${course.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== Course Modal =====
async function openCourseModal(courseId = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('courseModalTitle');
    const form = document.getElementById('courseForm');

    // Reset form
    form.reset();
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    document.querySelector('.color-option[data-color="#FFD93D"]').classList.add('selected');

    // Refresh major dropdown
    populateMajorDropdowns();

    // Refresh subject dropdown
    await populateSubjectDropdowns();

    if (courseId) {
        // Edit mode
        const course = await getCourseByIdAsync(courseId);
        if (course) {
            title.textContent = 'Edit Course';
            document.getElementById('courseId').value = course.id;
            document.getElementById('courseTitle').value = course.title;
            document.getElementById('courseDescription').value = course.description;
            document.getElementById('courseMajor').value = course.major || '';
            document.getElementById('courseSemester').value = course.semester || '';
            document.getElementById('courseSubject').value = course.subject || '';
            document.getElementById('courseInstructor').value = course.instructor || '';
            document.getElementById('courseCredits').value = course.credits || '';

            // Select color
            document.querySelectorAll('.color-option').forEach(o => {
                if (o.dataset.color === course.color) {
                    o.classList.add('selected');
                } else {
                    o.classList.remove('selected');
                }
            });
        }
    } else {
        // Add mode
        title.textContent = 'Add New Course';
        document.getElementById('courseId').value = '';

        // Pre-select major for Admin Lite
        if (currentAdminInfo.role === 'adminlite') {
            document.getElementById('courseMajor').value = currentAdminInfo.assignedMajor;
        }
    }

    modal.classList.add('show');
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('show');
}

async function saveCourse() {
    const courseId = document.getElementById('courseId').value;
    const title = document.getElementById('courseTitle').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const major = document.getElementById('courseMajor').value;
    const semester = document.getElementById('courseSemester').value;
    const subject = document.getElementById('courseSubject').value;
    const instructor = document.getElementById('courseInstructor').value.trim();
    const credits = parseInt(document.getElementById('courseCredits').value) || null;
    const selectedColor = document.querySelector('.color-option.selected');
    const color = selectedColor ? selectedColor.dataset.color : '#FFD93D';

    if (!title || !description || !major) {
        alert('Please fill in all required fields (Title, Description, Major).');
        return;
    }

    const courseData = { title, description, color, major, semester, subject, instructor, credits };

    const saveBtn = document.getElementById('saveCourseBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        if (courseId) {
            await updateCourseAsync(courseId, courseData);
        } else {
            await createCourseAsync(courseData);
        }

        closeCourseModal();
        await renderCoursesTable();
    } catch (error) {
        alert('Error saving course: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Course';
    }
}

// ===== Majors Management (Super Admin Only) =====
async function renderMajorsList() {
    cachedMajors = await getMajorsAsync();
    const list = document.getElementById('majorsList');
    const emptyState = document.getElementById('majorsEmpty');

    if (cachedMajors.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    emptyState.style.display = 'none';

    list.innerHTML = cachedMajors.map(major => `
    <div class="resource-item">
      <div class="resource-info">
        <div class="resource-icon" style="background: var(--accent-purple);">🎓</div>
        <span class="resource-title">${escapeHtml(major.name)}</span>
      </div>
      <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteMajor('${major.id}', '${escapeHtml(major.name)}')">Delete</button>
    </div>
  `).join('');
}

function openMajorModal() {
    document.getElementById('majorName').value = '';
    document.getElementById('majorModal').classList.add('show');
}

function closeMajorModal() {
    document.getElementById('majorModal').classList.remove('show');
}

async function saveMajor() {
    const name = document.getElementById('majorName').value.trim();
    if (!name) {
        alert('Please enter a major name.');
        return;
    }

    const result = await createMajorAsync(name);
    if (result) {
        closeMajorModal();
        await renderMajorsList();
        populateMajorDropdowns();
    } else {
        alert('Error creating major.');
    }
}

async function confirmDeleteMajor(majorId, majorName) {
    openDeleteModal(`Are you sure you want to delete "${majorName}"? This will not delete courses under this major, but they will become unorganized.`, async () => {
        await deleteMajorAsync(majorId);
        await renderMajorsList();
        populateMajorDropdowns();
    });
}

// ===== Subjects Management (Super Admin Only) =====
let cachedSubjects = [];

async function renderSubjectsList() {
    cachedSubjects = await getSubjectsAsync();
    const list = document.getElementById('subjectsList');
    const emptyState = document.getElementById('subjectsEmpty');

    if (cachedSubjects.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    emptyState.style.display = 'none';

    list.innerHTML = cachedSubjects.map(subject => `
    <div class="resource-item">
      <div class="resource-info">
        <div class="resource-icon" style="background: var(--accent-green);">📖</div>
        <span class="resource-title">${escapeHtml(subject.name)}</span>
      </div>
      <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteSubject('${subject.id}', '${escapeHtml(subject.name)}')">Delete</button>
    </div>
  `).join('');
}

function openSubjectModal() {
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectModal').classList.add('show');
}

function closeSubjectModal() {
    document.getElementById('subjectModal').classList.remove('show');
}

async function saveSubject() {
    const name = document.getElementById('subjectName').value.trim();
    if (!name) {
        alert('Please enter a subject name.');
        return;
    }

    const result = await createSubjectAsync(name);
    if (result) {
        closeSubjectModal();
        await renderSubjectsList();
        await populateSubjectDropdowns();
    } else {
        alert('Error creating subject.');
    }
}

async function confirmDeleteSubject(subjectId, subjectName) {
    openDeleteModal(`Are you sure you want to delete "${subjectName}"?`, async () => {
        await deleteSubjectAsync(subjectId);
        await renderSubjectsList();
    });
}

// ===== Admin Lite Management (Super Admin Only) =====
async function renderAdminsList() {
    const admins = await getAdminLitesAsync();
    const tableBody = document.getElementById('adminsTableBody');
    const emptyState = document.getElementById('adminsEmpty');
    const table = document.getElementById('adminsTable');

    if (admins.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    tableBody.innerHTML = admins.map(admin => `
    <tr>
      <td>${escapeHtml(admin.email)}</td>
      <td><span class="badge badge-semester">${escapeHtml(admin.assignedMajor)}</span></td>
      <td>
        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteAdmin('${admin.id}', '${escapeHtml(admin.email)}')">Remove</button>
      </td>
    </tr>
  `).join('');
}

function openAdminLiteModal() {
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminMajor').value = '';
    populateMajorDropdowns();
    document.getElementById('adminLiteModal').classList.add('show');
}

function closeAdminLiteModal() {
    document.getElementById('adminLiteModal').classList.remove('show');
}

async function saveAdminLite() {
    const email = document.getElementById('adminEmail').value.trim();
    const major = document.getElementById('adminMajor').value;

    if (!email || !major) {
        alert('Please fill in all fields.');
        return;
    }

    const result = await createAdminLiteAsync(email, major);
    if (result) {
        closeAdminLiteModal();
        await renderAdminsList();
    } else {
        alert('Error creating admin lite.');
    }
}

async function confirmDeleteAdmin(adminId, email) {
    openDeleteModal(`Are you sure you want to remove "${email}" as an Admin Lite?`, async () => {
        await deleteAdminLiteAsync(adminId);
        await renderAdminsList();
    });
}

// ===== Applications Management (Super Admin Only) =====
async function renderApplicationsList() {
    try {
        const snapshot = await firebaseDb.collection('adminApplications')
            .orderBy('appliedAt', 'desc')
            .get();

        const applications = [];
        snapshot.forEach(doc => {
            applications.push({ id: doc.id, ...doc.data() });
        });

        const list = document.getElementById('applicationsList');
        const emptyState = document.getElementById('applicationsEmpty');

        if (applications.length === 0) {
            list.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        list.style.display = 'flex';
        emptyState.style.display = 'none';

        list.innerHTML = applications.map(app => `
      <div class="resource-item" style="flex-direction: column; align-items: flex-start; gap: var(--space-sm);">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <div>
            <strong>${escapeHtml(app.email)}</strong>
            <span class="badge ${app.status === 'pending' ? 'badge-subject' : 'badge-semester'}" style="margin-left: 8px;">${app.status}</span>
          </div>
          <small style="color: var(--text-secondary);">${app.appliedAt ? new Date(app.appliedAt.toDate()).toLocaleDateString() : 'Unknown'}</small>
        </div>
        ${app.preferredMajor ? `<p style="margin: 0; font-size: 0.9rem;"><strong>Preferred Major:</strong> ${escapeHtml(app.preferredMajor)}</p>` : ''}
        ${app.message ? `<p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);"><em>"${escapeHtml(app.message)}"</em></p>` : ''}
        <div class="table-actions">
          <button class="btn btn-success" style="padding: 6px 12px; font-size: 0.85rem;" onclick="approveApplication('${app.id}', '${escapeHtml(app.email)}', '${escapeHtml(app.preferredMajor || '')}')">Approve</button>
          <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="rejectApplication('${app.id}', '${escapeHtml(app.email)}')">Reject</button>
        </div>
      </div>
    `).join('');
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// Google Apps Script Web App URL - SET THIS AFTER DEPLOYMENT
const EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVZzwtEP3_ACOd3KRPniFraK8VF6KJo90OWA2P6IVey0NK_TLEvhkWV_6GvyCdaM6kpw/exec'; // Paste your deployed Google Apps Script URL here

async function approveApplication(appId, email, preferredMajor) {
    // Show major selection if not specified
    const major = preferredMajor || prompt('Enter the major to assign to this admin:');
    if (!major) {
        alert('Please specify a major.');
        return;
    }

    // Prompt for password
    const password = prompt(`Enter a password for ${email}:\n\n(They will use this to log in along with their email)`);
    if (!password) {
        alert('Please specify a password.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    // Create admin lite record in Firestore
    const result = await createAdminLiteAsync(email, major);
    if (result) {
        // Update application status
        await firebaseDb.collection('adminApplications').doc(appId).update({
            status: 'approved',
            assignedMajor: major,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Send approval email via Google Apps Script
        if (EMAIL_SCRIPT_URL) {
            try {
                await fetch(EMAIL_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'approved',
                        email: email,
                        major: major,
                        password: password
                    })
                });
                console.log('Approval email sent');
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }

        await renderApplicationsList();
        alert(`✅ ${email} has been approved as Admin Lite for ${major}.\n\nPassword: ${password}\n\n${EMAIL_SCRIPT_URL ? 'An email notification has been sent!' : 'Note: Set EMAIL_SCRIPT_URL to enable email notifications.'}`);
    }
}

async function rejectApplication(appId, email) {
    if (confirm('Are you sure you want to reject this application?')) {
        await firebaseDb.collection('adminApplications').doc(appId).update({
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Send rejection email via Google Apps Script
        if (EMAIL_SCRIPT_URL) {
            try {
                await fetch(EMAIL_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'rejected',
                        email: email
                    })
                });
                console.log('Rejection email sent');
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }

        await renderApplicationsList();
        alert(`Application for ${email} has been rejected.${EMAIL_SCRIPT_URL ? '\n\nA notification email has been sent.' : ''}`);
    }
}

// ===== Course Detail Modal =====
async function openCourseDetailModal(courseId) {
    const course = await getCourseByIdAsync(courseId);
    if (!course) return;

    document.getElementById('detailCourseId').value = courseId;
    document.getElementById('courseDetailTitle').textContent = `Manage: ${course.title}`;

    // Hide all forms
    toggleForm('videoForm', false);
    toggleResourceForm(false);

    // Render lists
    renderVideosList(course);
    renderResourcesList(course);

    document.getElementById('courseDetailModal').classList.add('show');
}

async function closeCourseDetailModal() {
    document.getElementById('courseDetailModal').classList.remove('show');
    await renderCoursesTable();
}

function toggleForm(formId, show) {
    document.getElementById(formId).style.display = show ? 'block' : 'none';
    if (!show) {
        document.querySelectorAll(`#${formId} input`).forEach(input => input.value = '');
    }
}

// ===== Videos =====
function renderVideosList(course) {
    const list = document.getElementById('videosList');
    if (course.videos.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No videos added yet.</p>';
        return;
    }

    list.innerHTML = course.videos.map(video => `
    <div class="resource-item">
      <div class="resource-info">
        <div class="resource-icon" style="background: #FF6B9D;">📹</div>
        <span class="resource-title">${escapeHtml(video.title)}</span>
      </div>
      <div class="table-actions">
        <a href="https://www.youtube.com/watch?v=${escapeHtml(video.youtubeId)}" target="_blank" class="btn" style="padding: 6px 12px; font-size: 0.85rem;">View</a>
        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteVideo('${course.id}', '${video.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function saveVideo() {
    const courseId = document.getElementById('detailCourseId').value;
    const title = document.getElementById('videoTitle').value.trim();
    const youtubeUrl = document.getElementById('videoUrl').value.trim();

    if (!title || !youtubeUrl) {
        alert('Please fill in all fields.');
        return;
    }

    const saveBtn = document.getElementById('saveVideoBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Adding...';

    try {
        await addVideoAsync(courseId, { title, youtubeUrl });
        toggleForm('videoForm', false);
        const course = await getCourseByIdAsync(courseId);
        renderVideosList(course);
    } catch (error) {
        alert('Error adding video: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Add Video';
    }
}

// ===== Unified Resources =====
let pendingFlashcards = [];

function renderResourcesList(course) {
    const list = document.getElementById('resourcesList');
    const resources = course.resources || [];

    if (resources.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No resources added yet. Click "+ Add Resource" to add textbooks, PPTs, flashcards, problem sets, or question papers.</p>';
        return;
    }

    list.innerHTML = resources.map(resource => {
        const typeInfo = RESOURCE_TYPES[resource.type] || { icon: '📁', label: resource.type, color: '#666' };
        const isFlashcard = resource.type === 'flashcard';
        const cardCount = isFlashcard && resource.cards ? resource.cards.length : 0;

        return `
        <div class="resource-item">
          <div class="resource-info">
            <div class="resource-icon" style="background: ${typeInfo.color};">${typeInfo.icon}</div>
            <div>
              <span class="resource-title">${escapeHtml(resource.title)}</span>
              <br><small style="color: var(--text-secondary);">${typeInfo.label}${isFlashcard ? ` (${cardCount} cards)` : ''}</small>
            </div>
          </div>
          <div class="table-actions">
            ${isFlashcard ?
                `<button class="btn" style="padding: 6px 12px; font-size: 0.85rem;" onclick="previewFlashcardSet('${course.id}', '${resource.id}')">Preview</button>` :
                `<a href="${escapeHtml(resource.driveLink || '')}" target="_blank" class="btn" style="padding: 6px 12px; font-size: 0.85rem;">Open</a>`
            }
            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteResource('${course.id}', '${resource.id}')">Delete</button>
          </div>
        </div>
        `;
    }).join('');
}

function toggleResourceForm(show) {
    const form = document.getElementById('resourceForm');
    form.style.display = show ? 'block' : 'none';
    if (!show) {
        document.getElementById('resourceType').value = '';
        document.getElementById('resourceTitle').value = '';
        document.getElementById('resourceDriveLink').value = '';
        document.getElementById('flashcardCsvFile').value = '';
        document.getElementById('flashcardPreview').style.display = 'none';
        pendingFlashcards = [];
        toggleResourceFields();
    }
}

function toggleResourceFields() {
    const type = document.getElementById('resourceType').value;
    const driveLinkField = document.getElementById('driveLinkField');
    const flashcardField = document.getElementById('flashcardUploadField');

    if (type === 'flashcard') {
        driveLinkField.style.display = 'none';
        flashcardField.style.display = 'block';
    } else {
        driveLinkField.style.display = 'block';
        flashcardField.style.display = 'none';
    }
}

function previewFlashcards() {
    const fileInput = document.getElementById('flashcardCsvFile');
    const previewDiv = document.getElementById('flashcardPreview');
    const countEl = document.getElementById('flashcardCount');
    const sampleEl = document.getElementById('flashcardSample');

    if (!fileInput.files[0]) {
        previewDiv.style.display = 'none';
        pendingFlashcards = [];
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        pendingFlashcards = parseFlashcardCSV(csvText);

        if (pendingFlashcards.length === 0) {
            previewDiv.style.display = 'block';
            countEl.textContent = '⚠️ No valid flashcards found. Make sure Column A has questions and Column B has answers.';
            sampleEl.innerHTML = '';
            return;
        }

        previewDiv.style.display = 'block';
        countEl.textContent = `✅ Found ${pendingFlashcards.length} flashcards`;

        // Show first 3 as sample
        const samples = pendingFlashcards.slice(0, 3);
        sampleEl.innerHTML = samples.map((card, i) =>
            `<div style="margin-top: 8px; padding: 8px; background: white; border: 1px solid #ddd;">
              <strong>Q${i + 1}:</strong> ${escapeHtml(card.question.substring(0, 80))}${card.question.length > 80 ? '...' : ''}<br>
              <strong>A:</strong> ${escapeHtml(card.answer.substring(0, 80))}${card.answer.length > 80 ? '...' : ''}
            </div>`
        ).join('') + (pendingFlashcards.length > 3 ? `<p style="margin-top: 8px;">...and ${pendingFlashcards.length - 3} more</p>` : '');
    };
    reader.readAsText(fileInput.files[0]);
}

async function saveResource() {
    const courseId = document.getElementById('detailCourseId').value;
    const type = document.getElementById('resourceType').value;
    const title = document.getElementById('resourceTitle').value.trim();
    const driveLink = document.getElementById('resourceDriveLink').value.trim();

    if (!type || !title) {
        alert('Please select a type and enter a title.');
        return;
    }

    if (type === 'flashcard') {
        if (pendingFlashcards.length === 0) {
            alert('Please upload a valid CSV file with flashcards.');
            return;
        }
    } else {
        if (!driveLink) {
            alert('Please enter a Google Drive link.');
            return;
        }
    }

    const saveBtn = document.getElementById('saveResourceBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Adding...';

    try {
        await addResourceAsync(courseId, {
            type: type,
            title: title,
            driveLink: type !== 'flashcard' ? driveLink : null,
            cards: type === 'flashcard' ? pendingFlashcards : null
        });

        toggleResourceForm(false);
        const course = await getCourseByIdAsync(courseId);
        renderResourcesList(course);
    } catch (error) {
        alert('Error adding resource: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Add Resource';
    }
}

async function confirmDeleteResource(courseId, resourceId) {
    openDeleteModal('Are you sure you want to delete this resource?', async () => {
        await deleteResourceAsync(courseId, resourceId);
        const course = await getCourseByIdAsync(courseId);
        renderResourcesList(course);
    });
}

function previewFlashcardSet(courseId, resourceId) {
    // Open flashcard preview - for now just alert
    getCourseByIdAsync(courseId).then(course => {
        const resource = course.resources?.find(r => r.id === resourceId);
        if (resource && resource.cards) {
            let cardIndex = 0;
            const showCard = () => {
                if (cardIndex >= resource.cards.length) {
                    alert('End of flashcards!');
                    return;
                }
                const card = resource.cards[cardIndex];
                const showAnswer = confirm(`Question ${cardIndex + 1}/${resource.cards.length}:\n\n${card.question}\n\nClick OK to see answer, Cancel to stop.`);
                if (showAnswer) {
                    alert(`Answer:\n\n${card.answer}`);
                    cardIndex++;
                    showCard();
                }
            };
            showCard();
        }
    });
}

// Legacy compatibility wrappers
function renderPapersList(course) {
    // Papers are now in resources
    renderResourcesList(course);
}

function renderProblemsList(course) {
    // Problems are now in resources
    renderResourcesList(course);
}

// ===== Delete Confirmations =====
let deleteCallback = null;

function openDeleteModal(message, callback) {
    document.getElementById('deleteMessage').textContent = message;
    deleteCallback = callback;
    document.getElementById('deleteModal').classList.add('show');

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        if (deleteCallback) await deleteCallback();
        closeDeleteModal();
    };
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteCallback = null;
}

async function confirmDeleteCourse(courseId) {
    const course = await getCourseByIdAsync(courseId);
    openDeleteModal(
        `Are you sure you want to delete "${course.title}"? This will also delete all associated videos and resources.`,
        async () => {
            await deleteCourseAsync(courseId);
            await renderCoursesTable();
        }
    );
}

async function confirmDeleteVideo(courseId, videoId) {
    openDeleteModal('Are you sure you want to delete this video?', async () => {
        await deleteVideoAsync(courseId, videoId);
        const course = await getCourseByIdAsync(courseId);
        renderVideosList(course);
    });
}

async function confirmDeletePaper(courseId, paperId) {
    openDeleteModal('Are you sure you want to delete this question paper?', async () => {
        await deleteQuestionPaperAsync(courseId, paperId);
        const course = await getCourseByIdAsync(courseId);
        renderPapersList(course);
    });
}

async function confirmDeleteProblem(courseId, problemId) {
    openDeleteModal('Are you sure you want to delete this problem set?', async () => {
        await deleteProblemSetAsync(courseId, problemId);
        const course = await getCourseByIdAsync(courseId);
        renderProblemsList(course);
    });
}

// ===== Utility =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Universities Management =====
let cachedUniversities = [];

async function renderUniversitiesList() {
    cachedUniversities = await getUniversitiesAsync();
    const list = document.getElementById('universitiesList');
    const empty = document.getElementById('universitiesEmpty');

    if (cachedUniversities.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    empty.style.display = 'none';

    list.innerHTML = cachedUniversities.map(uni => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-icon" style="background: var(--accent-pink);">🏫</div>
                <div>
                    <strong>${escapeHtml(uni.name)}</strong>
                    ${uni.shortCode ? `<br><small style="color: var(--text-secondary);">${escapeHtml(uni.shortCode)}</small>` : ''}
                </div>
            </div>
            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="confirmDeleteUniversity('${uni.id}')">Delete</button>
        </div>
    `).join('');
}

function openUniversityModal() {
    document.getElementById('universityName').value = '';
    document.getElementById('universityShortCode').value = '';
    document.getElementById('universityModal').classList.add('show');
}

function closeUniversityModal() {
    document.getElementById('universityModal').classList.remove('show');
}

async function saveUniversity() {
    const name = document.getElementById('universityName').value.trim();
    const shortCode = document.getElementById('universityShortCode').value.trim();

    if (!name) {
        alert('Please enter the university name.');
        return;
    }

    const result = await createUniversityAsync(name, shortCode);
    if (result) {
        closeUniversityModal();
        await renderUniversitiesList();
        populateUniversityDropdowns();
        alert('University added successfully!');
    } else {
        alert('Error creating university. Make sure you have Super Admin permissions.');
    }
}

async function confirmDeleteUniversity(universityId) {
    if (confirm('Delete this university? This will not delete associated timetables or events.')) {
        const result = await deleteUniversityAsync(universityId);
        if (result) {
            await renderUniversitiesList();
            populateUniversityDropdowns();
        }
    }
}

async function populateUniversityDropdowns() {
    if (cachedUniversities.length === 0) {
        cachedUniversities = await getUniversitiesAsync();
    }

    const selects = [
        'timetableUniversityFilter', 'eventUniversityFilter',
        'timetableUniversity', 'eventUniversity'
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const firstOption = id.includes('Filter') ? '<option value="">Select University...</option>' : '';
            select.innerHTML = firstOption + cachedUniversities.map(uni =>
                `<option value="${uni.id}">${escapeHtml(uni.name)}</option>`
            ).join('');
        }
    });
}

// ===== Timetables Management =====
let cachedTimetables = [];
let subjectEntryCount = 0;

async function renderTimetablesList() {
    const universityId = document.getElementById('timetableUniversityFilter').value;
    const semester = document.getElementById('timetableSemesterFilter').value;

    if (!universityId) {
        document.getElementById('timetablesList').innerHTML = '<p class="text-muted">Please select a university to view timetables.</p>';
        document.getElementById('timetablesEmpty').style.display = 'none';
        return;
    }

    cachedTimetables = await getTimetableAsync(universityId, semester || null, null);
    const list = document.getElementById('timetablesList');
    const empty = document.getElementById('timetablesEmpty');

    if (cachedTimetables.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    empty.style.display = 'none';

    list.innerHTML = cachedTimetables.map(tt => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-icon" style="background: var(--accent-cyan);">📅</div>
                <div>
                    <strong>${escapeHtml(tt.major)} - ${escapeHtml(tt.semester)}</strong>
                    <br><small style="color: var(--text-secondary);">${tt.subjects?.length || 0} subjects</small>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="editTimetable('${tt.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="confirmDeleteTimetable('${tt.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function openTimetableModal(timetableId = null) {
    document.getElementById('timetableId').value = timetableId || '';
    document.getElementById('timetableSubjects').innerHTML = '';
    subjectEntryCount = 0;

    // Populate major dropdown
    const majorSelect = document.getElementById('timetableMajor');
    majorSelect.innerHTML = cachedMajors.map(m =>
        `<option value="${m.name}">${escapeHtml(m.name)}</option>`
    ).join('');

    if (!timetableId) {
        addSubjectEntry(); // Add one empty subject entry
    }

    document.getElementById('timetableModal').classList.add('show');
}

function closeTimetableModal() {
    document.getElementById('timetableModal').classList.remove('show');
}

function addSubjectEntry() {
    const container = document.getElementById('timetableSubjects');
    const idx = subjectEntryCount++;

    const entry = document.createElement('div');
    entry.className = 'subject-entry';
    entry.style.cssText = 'border: 2px solid var(--border-color); padding: 1rem; margin-bottom: 0.5rem; background: var(--bg-secondary);';
    entry.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 80px; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="text" class="form-input subject-name" placeholder="Subject Name *" style="font-size: 0.9rem;">
            <input type="number" class="form-input subject-credits" placeholder="Credits" min="1" max="10" style="font-size: 0.9rem;">
        </div>
        <div class="schedule-entries">
            <div style="display: grid; grid-template-columns: 1fr 80px 80px 100px auto; gap: 0.25rem; margin-bottom: 0.25rem;">
                <select class="form-select schedule-day" style="font-size: 0.8rem; padding: 0.5rem;">
                    <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                    <option>Thursday</option><option>Friday</option><option>Saturday</option>
                </select>
                <input type="time" class="form-input schedule-start" value="09:00" style="font-size: 0.8rem; padding: 0.5rem;">
                <input type="time" class="form-input schedule-end" value="10:00" style="font-size: 0.8rem; padding: 0.5rem;">
                <input type="text" class="form-input schedule-room" placeholder="Room" style="font-size: 0.8rem; padding: 0.5rem;">
                <button type="button" class="btn" onclick="this.parentElement.remove()" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">×</button>
            </div>
        </div>
        <button type="button" class="btn btn-success" onclick="addScheduleSlot(this)" style="padding: 4px 8px; font-size: 0.75rem; margin-bottom: 0.5rem;">+ Time Slot</button>
        <div style="margin-top: 0.5rem;">
            <input type="text" class="form-input subject-portions" placeholder="Portions (e.g., Unit 1-4, All chapters)" style="font-size: 0.85rem; margin-bottom: 0.25rem;">
            <input type="text" class="form-input subject-topics" placeholder="Important Topics (comma-separated)" style="font-size: 0.85rem;">
        </div>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="margin-top: 0.5rem; padding: 4px 8px; font-size: 0.75rem;">Remove Subject</button>
    `;
    container.appendChild(entry);
}

function addScheduleSlot(btn) {
    const container = btn.previousElementSibling;
    const slot = document.createElement('div');
    slot.style.cssText = 'display: grid; grid-template-columns: 1fr 80px 80px 100px auto; gap: 0.25rem; margin-bottom: 0.25rem;';
    slot.innerHTML = `
        <select class="form-select schedule-day" style="font-size: 0.8rem; padding: 0.5rem;">
            <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
            <option>Thursday</option><option>Friday</option><option>Saturday</option>
        </select>
        <input type="time" class="form-input schedule-start" value="09:00" style="font-size: 0.8rem; padding: 0.5rem;">
        <input type="time" class="form-input schedule-end" value="10:00" style="font-size: 0.8rem; padding: 0.5rem;">
        <input type="text" class="form-input schedule-room" placeholder="Room" style="font-size: 0.8rem; padding: 0.5rem;">
        <button type="button" class="btn" onclick="this.parentElement.remove()" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">×</button>
    `;
    container.appendChild(slot);
}

async function saveTimetable() {
    const universityId = document.getElementById('timetableUniversity').value;
    const semester = document.getElementById('timetableSemester').value;
    const major = document.getElementById('timetableMajor').value;

    if (!universityId || !semester || !major) {
        alert('Please fill in all required fields.');
        return;
    }

    const subjects = [];
    document.querySelectorAll('.subject-entry').forEach(entry => {
        const name = entry.querySelector('.subject-name').value.trim();
        if (!name) return;

        const schedule = [];
        entry.querySelectorAll('.schedule-entries > div').forEach(slot => {
            schedule.push({
                day: slot.querySelector('.schedule-day').value,
                startTime: slot.querySelector('.schedule-start').value,
                endTime: slot.querySelector('.schedule-end').value,
                room: slot.querySelector('.schedule-room').value.trim()
            });
        });

        subjects.push({
            name: name,
            credits: parseInt(entry.querySelector('.subject-credits').value) || 0,
            schedule: schedule,
            portions: entry.querySelector('.subject-portions').value.trim(),
            importantTopics: entry.querySelector('.subject-topics').value.split(',').map(t => t.trim()).filter(t => t)
        });
    });

    const timetableData = {
        id: document.getElementById('timetableId').value || null,
        universityId,
        semester,
        major,
        subjects
    };

    const result = await saveTimetableAsync(timetableData);
    if (result) {
        closeTimetableModal();
        await renderTimetablesList();
        alert('Timetable saved successfully!');
    } else {
        alert('Error saving timetable.');
    }
}

async function editTimetable(timetableId) {
    const tt = cachedTimetables.find(t => t.id === timetableId);
    if (!tt) return;

    openTimetableModal(timetableId);

    document.getElementById('timetableUniversity').value = tt.universityId;
    document.getElementById('timetableSemester').value = tt.semester;
    document.getElementById('timetableMajor').value = tt.major;

    // Load subjects
    document.getElementById('timetableSubjects').innerHTML = '';
    subjectEntryCount = 0;

    if (tt.subjects) {
        tt.subjects.forEach(subject => {
            addSubjectEntry();
            const entries = document.querySelectorAll('.subject-entry');
            const entry = entries[entries.length - 1];

            entry.querySelector('.subject-name').value = subject.name;
            entry.querySelector('.subject-credits').value = subject.credits || '';
            entry.querySelector('.subject-portions').value = subject.portions || '';
            entry.querySelector('.subject-topics').value = (subject.importantTopics || []).join(', ');

            // Add schedule slots
            const scheduleContainer = entry.querySelector('.schedule-entries');
            scheduleContainer.innerHTML = '';
            (subject.schedule || []).forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 80px 80px 100px auto; gap: 0.25rem; margin-bottom: 0.25rem;';
                slotDiv.innerHTML = `
                    <select class="form-select schedule-day" style="font-size: 0.8rem; padding: 0.5rem;">
                        <option ${slot.day === 'Monday' ? 'selected' : ''}>Monday</option>
                        <option ${slot.day === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
                        <option ${slot.day === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                        <option ${slot.day === 'Thursday' ? 'selected' : ''}>Thursday</option>
                        <option ${slot.day === 'Friday' ? 'selected' : ''}>Friday</option>
                        <option ${slot.day === 'Saturday' ? 'selected' : ''}>Saturday</option>
                    </select>
                    <input type="time" class="form-input schedule-start" value="${slot.startTime}" style="font-size: 0.8rem; padding: 0.5rem;">
                    <input type="time" class="form-input schedule-end" value="${slot.endTime}" style="font-size: 0.8rem; padding: 0.5rem;">
                    <input type="text" class="form-input schedule-room" value="${slot.room || ''}" placeholder="Room" style="font-size: 0.8rem; padding: 0.5rem;">
                    <button type="button" class="btn" onclick="this.parentElement.remove()" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">×</button>
                `;
                scheduleContainer.appendChild(slotDiv);
            });
        });
    }
}

async function confirmDeleteTimetable(timetableId) {
    if (confirm('Delete this timetable?')) {
        await deleteTimetableAsync(timetableId);
        await renderTimetablesList();
    }
}

// ===== Academic Events Management =====
let cachedEvents = [];

async function renderEventsList() {
    const universityId = document.getElementById('eventUniversityFilter').value;

    if (!universityId) {
        document.getElementById('eventsList').innerHTML = '<p class="text-muted">Please select a university to view events.</p>';
        document.getElementById('eventsEmpty').style.display = 'none';
        return;
    }

    cachedEvents = await getAcademicEventsAsync(universityId);
    const list = document.getElementById('eventsList');
    const empty = document.getElementById('eventsEmpty');

    if (cachedEvents.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    empty.style.display = 'none';

    const typeColors = {
        internal: '#FF6B9D', final: '#FF6B6B', holiday: '#6BCB77',
        event: '#4ECDC4', deadline: '#FFD93D'
    };
    const typeIcons = {
        internal: '📝', final: '🎓', holiday: '🎉', event: '📅', deadline: '⏰'
    };

    list.innerHTML = cachedEvents.map(evt => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-icon" style="background: ${typeColors[evt.type] || '#666'};">${typeIcons[evt.type] || '📅'}</div>
                <div>
                    <strong>${escapeHtml(evt.title)}</strong>
                    <br><small style="color: var(--text-secondary);">${evt.startDate}${evt.endDate && evt.endDate !== evt.startDate ? ' → ' + evt.endDate : ''}</small>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="editEvent('${evt.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="confirmDeleteEvent('${evt.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function openEventModal(eventId = null) {
    document.getElementById('eventId').value = eventId || '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventType').value = 'internal';
    document.getElementById('eventStartDate').value = '';
    document.getElementById('eventEndDate').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventModal').classList.add('show');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('show');
}

async function saveEvent() {
    const universityId = document.getElementById('eventUniversity').value;
    const title = document.getElementById('eventTitle').value.trim();
    const type = document.getElementById('eventType').value;
    const startDate = document.getElementById('eventStartDate').value;
    const endDate = document.getElementById('eventEndDate').value;
    const description = document.getElementById('eventDescription').value.trim();
    const eventId = document.getElementById('eventId').value;

    if (!universityId || !title || !startDate) {
        alert('Please fill in all required fields.');
        return;
    }

    const eventData = {
        universityId,
        title,
        type,
        startDate,
        endDate: endDate || startDate,
        description
    };

    let result;
    if (eventId) {
        result = await updateAcademicEventAsync(eventId, eventData);
    } else {
        result = await addAcademicEventAsync(eventData);
    }

    if (result) {
        closeEventModal();
        await renderEventsList();
        alert('Event saved successfully!');
    } else {
        alert('Error saving event.');
    }
}

function editEvent(eventId) {
    const evt = cachedEvents.find(e => e.id === eventId);
    if (!evt) return;

    openEventModal(eventId);
    document.getElementById('eventUniversity').value = evt.universityId;
    document.getElementById('eventTitle').value = evt.title;
    document.getElementById('eventType').value = evt.type;
    document.getElementById('eventStartDate').value = evt.startDate;
    document.getElementById('eventEndDate').value = evt.endDate || '';
    document.getElementById('eventDescription').value = evt.description || '';
}

async function confirmDeleteEvent(eventId) {
    if (confirm('Delete this event?')) {
        await deleteAcademicEventAsync(eventId);
        await renderEventsList();
    }
}

// ===== Certificate Courses Management =====
let cachedCertCourses = [];

async function renderCertCoursesList() {
    cachedCertCourses = await getCertificateCoursesAsync();
    const list = document.getElementById('certCoursesList');
    const emptyState = document.getElementById('certCoursesEmpty');

    if (cachedCertCourses.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    emptyState.style.display = 'none';

    list.innerHTML = cachedCertCourses.map(course => `
    <div class="resource-item" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
        <div class="resource-info">
          <div class="resource-icon" style="background: var(--accent-purple);">🏆</div>
          <div>
            <span class="resource-title" style="font-size: 1.1rem;">${escapeHtml(course.title)}</span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
              ${course.modules?.length || 0} Modules • Passing: ${course.passingScore}%
              ${course.published ? '<span style="color: var(--accent-green);">✓ Published</span>' : '<span style="color: var(--accent-orange);">Draft</span>'}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="window.location.href='cert-course-builder.html?id=${course.id}'">Edit Course</button>
          <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="confirmDeleteCertCourse('${course.id}', '${escapeHtml(course.title)}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function confirmDeleteCertCourse(courseId, title) {
    if (confirm(`Delete certificate course "${title}"? This cannot be undone.`)) {
        const result = await deleteCertificateCourseAsync(courseId);
        if (result) {
            await renderCertCoursesList();
        } else {
            alert('Error deleting course.');
        }
    }
}

// Event listener for Add Certificate Course button
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addCertCourseBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'cert-course-builder.html';
        });
    }
});
