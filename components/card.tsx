export default function Card({
  title,
  description,
  icon: Icon,
  className = "",
  children,
  loading,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 flex flex-col items-start space-x-4 ${className}`}
    >
      {Icon && <Icon className="text-green-600 w-8 h-8" />}

      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      {children && <>{children}</>}
      {loading ? (
        <div className="animate-pulse p-4 w-full">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>
      ) : null}
    </div>
  );
}
