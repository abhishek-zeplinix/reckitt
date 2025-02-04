
const TableSkeleton = () => {

  return (
    <div className="w-full border border-gray-300 rounded-lg">

      {/* header */}
      <div className="grid grid-cols-4 bg-gray-200 p-3 rounded-t-lg">
        {Array(5)
          .fill("")
          .map((_, index) => (
            <div
              key={index}
              className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"
            ></div>
          ))}
      </div>

      {/* rows */}
      {Array(20)
        .fill("")
        .map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-4 p-3 border-t border-gray-300"
          >
            {Array(5)
              .fill("")
              .map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"
                ></div>
              ))}
          </div>
        ))}
    </div>
  );
};

export default TableSkeleton;
