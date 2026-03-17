import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">School Transition</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-primary-600 font-medium">Home</Link>
                            <Link to="/about" className="text-gray-500 hover:text-gray-900 transition-colors">About Us</Link>
                            <Link to="/contact" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="hidden md:inline-flex text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Go to Portal
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gray-50 pt-16 pb-32">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl max-w-4xl mx-auto">
                        <span className="block">Transforming the journey from</span>
                        <span className="block text-primary-600">primary to secondary school</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl">
                        Streamline admissions, enhance communication, and ensure no student falls through the cracks during the critical transition period.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                        >
                            Access Portal
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all"
                        >
                            Learn more
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage transitions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: 'Data Integration',
                                desc: 'Seamlessly sync student data between feeder schools and secondary destinations.',
                                icon: <BookOpen className="h-6 w-6 text-primary-600" />
                            },
                            {
                                title: 'Parent Communication',
                                desc: 'Keep parents informed at every step of the admission and transition process.',
                                icon: <Users className="h-6 w-6 text-primary-600" />
                            },
                            {
                                title: 'Streamlined Admissions',
                                desc: 'Automate forms, document collection, and placement decisions efficiently.',
                                icon: <CheckCircle className="h-6 w-6 text-primary-600" />
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="relative p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="absolute top-8 left-8 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    {feature.icon}
                                </div>
                                <div className="mt-16">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <BookOpen className="h-6 w-6 text-primary-400" />
                        <span className="text-xl font-bold">School Transition</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} School Transition Ltd. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
