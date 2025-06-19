

const Tooltip = ({ children, message }) => {
  return (
    <div className="relative group inline-flex items-center justify-center ">
      {children}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2 mr-2
        bg-black text-white text-sm rounded-md py-1 px-3 shadow-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        z-50 whitespace-nowrap
        after:content-[''] after:absolute after:top-1/2 after:left-full after:-translate-y-1/2
        after:border-8 after:border-transparent after:border-l-black "
      >
        {message}
      </div>
    </div>
  );
};

export default Tooltip;
