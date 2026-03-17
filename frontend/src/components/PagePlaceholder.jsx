const PagePlaceholder = ({ title, description }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                    <p className="text-gray-600 mb-8">{description}</p>

                    {/* Skeleton Content */}
                    <div className="space-y-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
                            <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
                            <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
                        </div>
                        <div className="h-64 bg-gray-100 rounded-lg border border-gray-200"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagePlaceholder;
