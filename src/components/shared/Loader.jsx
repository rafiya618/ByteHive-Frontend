const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            {/* Animated spinner */}
            <div className="relative w-16 h-16">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                {/* Spinning ring */}
                <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            </div>

            {/* Loading text */}
            <p className="mt-4 text-white font-lato text-lg animate-pulse">
                {message}
            </p>
        </div>
    );
};

export default Loader;
