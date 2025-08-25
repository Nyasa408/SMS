import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, setLogLevel } from 'firebase/firestore';
import { Trash2, Edit, PlusCircle, User, Mail, Phone, Search, X } from 'lucide-react';

// --- Firebase Configuration ---
// This configuration is provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-student-app';

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [students, setStudents] = React.useState([]);
    const [filteredStudents, setFilteredStudents] = React.useState([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [currentStudent, setCurrentStudent] = React.useState({ name: '', email: '', phone: '', studentId: '' });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [db, setDb] = React.useState(null);
    const [auth, setAuth] = React.useState(null);
    const [userId, setUserId] = React.useState(null);

    // --- Firebase Initialization and Authentication ---
    React.useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);
            setLogLevel('debug'); // Optional: for detailed Firestore logs

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                        await signInAnonymously(firebaseAuth);
                    } catch (authError) {
                        console.error("Anonymous sign-in failed:", authError);
                        setError("Authentication failed. Please refresh the page.");
                    }
                }
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase initialization error:", e);
            setError("Could not connect to the database. Please check your configuration.");
            setIsLoading(false);
        }
    }, []);

    // --- Firestore Data Fetching (Real-time) ---
    React.useEffect(() => {
        if (!db || !userId) return;

        setIsLoading(true);
        const studentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/students`);
        
        const unsubscribe = onSnapshot(studentsCollectionRef, (snapshot) => {
            const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(studentsList);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching students:", err);
            setError("Failed to fetch student data.");
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [db, userId]);

    // --- Search and Filter Logic ---
    React.useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const results = students.filter(student =>
            student.name.toLowerCase().includes(lowercasedTerm) ||
            student.email.toLowerCase().includes(lowercasedTerm) ||
            student.studentId.toString().includes(lowercasedTerm)
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    // --- Modal Control ---
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setCurrentStudent({ name: '', email: '', phone: '', studentId: '' });
        setError(null);
    };

    // --- Form Handling ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!currentStudent.name || !currentStudent.email || !currentStudent.studentId) {
            setError("Name, Email, and Student ID are required.");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(currentStudent.email)) {
            setError("Please enter a valid email address.");
            return false;
        }
        return true;
    };

    // --- CRUD Operations ---
    const handleAddStudent = async () => {
        if (!validateForm()) return;
        
        try {
            const studentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/students`);
            await addDoc(studentsCollectionRef, currentStudent);
            closeModal();
        } catch (e) {
            console.error("Error adding document: ", e);
            setError("Failed to add student. Please try again.");
        }
    };

    const handleUpdateStudent = async () => {
        if (!validateForm()) return;

        try {
            const studentDocRef = doc(db, `artifacts/${appId}/users/${userId}/students`, currentStudent.id);
            await updateDoc(studentDocRef, currentStudent);
            closeModal();
        } catch (e) {
            console.error("Error updating document: ", e);
            setError("Failed to update student. Please try again.");
        }
    };

    const handleDeleteStudent = async (id) => {
        // Using a custom confirmation modal instead of window.confirm
        if (window.customConfirm ? await window.customConfirm("Are you sure you want to delete this student?") : true) {
             try {
                const studentDocRef = doc(db, `artifacts/${appId}/users/${userId}/students`, id);
                await deleteDoc(studentDocRef);
            } catch (e) {
                console.error("Error deleting document: ", e);
                setError("Failed to delete student. Please try again.");
            }
        }
    };
    
    const startEdit = (student) => {
        setIsEditMode(true);
        setCurrentStudent(student);
        openModal();
    };

    // --- Render Logic ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Header --- */}
                <header className="bg-white shadow-md rounded-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Student Management System</h1>
                            <p className="text-md text-gray-500 mt-1">A final project for university.</p>
                        </div>
                        <button
                            onClick={openModal}
                            className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <PlusCircle size={20} />
                            Add Student
                        </button>
                    </div>
                </header>

                {/* --- Search and Info Bar --- */}
                <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                        Total Students: <span className="font-bold text-blue-600">{students.length}</span>
                    </div>
                </div>

                {/* --- Main Content: Student Table --- */}
                <main className="bg-white shadow-md rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center p-10">
                                <p className="text-lg text-gray-500">Loading student data...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center p-10">
                                <User size={48} className="mx-auto text-gray-300" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Students Found</h3>
                                <p className="mt-1 text-gray-500">Click "Add Student" to get started.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Student ID</th>
                                        <th className="p-4 font-semibold text-gray-600">Name</th>
                                        <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Email</th>
                                        <th className="p-4 font-semibold text-gray-600 hidden lg:table-cell">Phone</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-mono text-gray-700">{student.studentId}</td>
                                            <td className="p-4 font-medium text-gray-900">{student.name}</td>
                                            <td className="p-4 text-gray-600 hidden md:table-cell">{student.email}</td>
                                            <td className="p-4 text-gray-600 hidden lg:table-cell">{student.phone || 'N/A'}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button onClick={() => startEdit(student)} className="text-blue-600 hover:text-blue-800 transition-colors" aria-label="Edit student">
                                                        <Edit size={20} />
                                                    </button>
                                                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-800 transition-colors" aria-label="Delete student">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {filteredStudents.length === 0 && students.length > 0 && (
                            <div className="text-center p-10">
                                <h3 className="text-xl font-semibold text-gray-700">No Matching Students</h3>
                                <p className="mt-1 text-gray-500">Try a different search term.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- Modal for Add/Edit Student --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" role="dialog" aria-modal="true">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    {/* Form Fields */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input type="text" id="name" name="name" value={currentStudent.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input type="email" id="email" name="email" value={currentStudent.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">#</span>
                                            <input type="text" id="studentId" name="studentId" value={currentStudent.studentId} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input type="tel" id="phone" name="phone" value={currentStudent.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 mt-2">
                                    <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                                    <button type="submit" onClick={isEditMode ? handleUpdateStudent : handleAddStudent} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                        {isEditMode ? 'Save Changes' : 'Add Student'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
