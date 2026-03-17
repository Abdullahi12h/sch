import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    ArrowLeft,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    UserCircle,
    TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AttendanceHistoryModal = ({ student, onClose, user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`/api/attendance?studentId=${student.id}`, config);
                setHistory(data);
            } catch (error) {
                console.error('Error fetching student history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [student, user]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'P': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'A': return <XCircle className="h-4 w-4 text-rose-500" />;
            case 'S': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'V': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'L': return <Clock className="h-4 w-4 text-indigo-500" />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'P': return 'Present';
            case 'A': return 'Absent';
            case 'S': return 'Sick';
            case 'V': return 'Vacation';
            case 'L': return 'Late';
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{student.name}</h2>
                            <p className="text-xs text-gray-500">Attendance History</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">Loading history...</div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-gray-700">
                                            {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-100">
                                            {record.period}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-xs text-gray-500 italic max-w-[150px] truncate">
                                            {record.reason || ''}
                                        </div>
                                        <div className="flex items-center gap-2 min-w-[100px] justify-end">
                                            {getStatusIcon(record.status)}
                                            <span className="text-sm font-semibold text-gray-700">{getStatusText(record.status)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">No attendance history found for this student.</div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const GradeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [grade, setGrade] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                // Fetch grade details
                const { data: gradeData } = await axios.get(`/api/grades/${id}`, config);
                setGrade(gradeData);

                // Fetch students matching this grade name
                const { data: allStudents } = await axios.get('/api/students', config);
                const gradeStudents = allStudents.filter(s => s.grade === gradeData.name);
                setStudents(gradeStudents);
            } catch (error) {
                console.error('Error fetching grade details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toString().includes(search)
    );

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading class details...</div>;
    if (!grade) return <div className="text-center py-20">Grade not found.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {selectedStudent && (
                <AttendanceHistoryModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    user={user}
                />
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/grades')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{grade.name} <span className="text-gray-400 font-normal">({grade.code})</span></h1>
                        <p className="text-sm text-gray-500 mt-0.5">Class management and student performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                        <span className={`text-sm font-bold ${grade.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{grade.status}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity</p>
                        <p className="text-sm font-bold text-gray-900">{students.length} / {grade.capacity}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((students.length / grade.capacity) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Avg. Attendance</p>
                            <p className="text-2xl font-bold text-gray-900">92%</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Based on current month records</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Absences</p>
                            <p className="text-2xl font-bold text-gray-900">{students.reduce((acc, s) => acc + (s.absences || 0), 0)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Cumulative for all students</p>
                </div>
            </div>

            {/* Subjects Section */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Assigned Subjects</h3>
                <div className="flex flex-wrap gap-2">
                    {grade.subjects && grade.subjects.length > 0 ? (
                        grade.subjects.map((sub, i) => (
                            <div key={i} className="bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 group hover:border-blue-500 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                <span className="text-sm font-bold text-gray-700">{sub}</span>
                            </div>
                        ))
                    ) : (
                        <div className="w-full bg-gray-50 border border-dashed border-gray-200 py-6 rounded-2xl text-center">
                            <p className="text-sm text-gray-400 italic">No subjects assigned to this grade yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-indigo-500" />
                        Students Enrolled
                    </h3>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 w-64 shadow-sm focus-within:border-indigo-400 transition-colors">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Gender</th>
                                <th className="px-6 py-4 text-center">Absences</th>
                                <th className="px-6 py-4 text-center">Address</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-indigo-50/20 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-400">#{s.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{s.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{s.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                            {s.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${s.absences > 10 ? 'text-rose-600' : 'text-gray-700'}`}>
                                            {s.absences || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-gray-900">{s.address || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedStudent(s)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-[#2563EB] hover:text-white hover:border-[#1d4ed8] transition-all shadow-sm active:scale-95"
                                        >
                                            <Clock className="h-3.5 w-3.5" />
                                            History
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No students found in this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradeDetails;
