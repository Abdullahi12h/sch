import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AcademicYearContext = createContext();

export const AcademicYearProvider = ({ children }) => {
    const { user } = useAuth();
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('All');
    const [loadingYears, setLoadingYears] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchYears = async () => {
            try {
                const { data } = await axios.get('/api/academic-years', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAcademicYears(data);

                // Auto-select the current academic year
                const currentYear = data.find(y => y.isCurrent);
                if (currentYear) {
                    setSelectedYear(currentYear.name);
                } else if (data.length > 0) {
                    setSelectedYear(data[0].name);
                }
            } catch (err) {
                console.error('Error fetching academic years:', err);
            } finally {
                setLoadingYears(false);
            }
        };
        fetchYears();
    }, [user]);

    return (
        <AcademicYearContext.Provider value={{ academicYears, selectedYear, setSelectedYear, loadingYears }}>
            {children}
        </AcademicYearContext.Provider>
    );
};

export const useAcademicYear = () => useContext(AcademicYearContext);
