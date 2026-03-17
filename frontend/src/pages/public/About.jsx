import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">About Us</span>
                        </div>
                        <div className="w-24"></div> {/* Spacer to center title */}
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Our Mission</h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Making the transition between schools seamless, secure, and stress-free for educators, parents, and most importantly, students.
                    </p>
                </div>

                <div className="prose prose-lg prose-primary mx-auto text-gray-500">
                    <p>
                        The transition from primary to secondary education is one of the most significant milestones in a child's life. However, the administrative burden placed on schools during this period often detracts from the vital pastoral care needed to support students.
                    </p>
                    <div className="bg-primary-50 rounded-2xl p-8 my-10 border border-primary-100">
                        <h3 className="text-2xl font-bold text-primary-900 mb-4 mt-0">Why we built this platform</h3>
                        <p className="text-primary-800 m-0">
                            We partnered with over 50 schools to understand their pain points. The result is a unified platform that acts as a secure bridge, allowing data, forms, and vital context to flow seamlessly securely between institutions.
                        </p>
                    </div>
                    <p>
                        Our portal is designed specifically to mirror the rigorous requirements of modern education systems while remaining incredibly intuitive to use. From automated admissions tracking to dynamic communication tools, we provide the infrastructure so schools can focus on education.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
