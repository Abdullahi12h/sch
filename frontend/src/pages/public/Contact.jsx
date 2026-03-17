import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">Contact Us</span>
                        </div>
                        <div className="w-24"></div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Contact Info */}
                        <div className="bg-primary-700 p-10 text-white">
                            <h2 className="text-3xl font-bold mb-4">Get in touch</h2>
                            <p className="text-primary-100 mb-10 text-lg">
                                Interested in bringing the School Transition platform to your trust or local authority? We'd love to hear from you.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <Mail className="h-6 w-6 text-primary-300 mr-4 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Email us</h3>
                                        <p className="text-primary-100 mt-1">support@schooltransition.co.uk</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="h-6 w-6 text-primary-300 mr-4 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Call us</h3>
                                        <p className="text-primary-100 mt-1">+44 (0) 20 1234 5678</p>
                                        <p className="text-sm text-primary-200 mt-1">Mon-Fri, 9am to 5pm</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="h-6 w-6 text-primary-300 mr-4 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Visit us</h3>
                                        <p className="text-primary-100 mt-1">
                                            1 Education Way<br />
                                            London, UK<br />
                                            EC1A 1BB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="p-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5 px-3 border" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5 px-3 border" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5 px-3 border" placeholder="jane@school.edu" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea rows="4" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5 px-3 border" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
