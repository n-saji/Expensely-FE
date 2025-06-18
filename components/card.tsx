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
      className={`bg-white shadow-md rounded-lg p-6 flex flex-col items-start space-y-4 ${className}
        dark:bg-gray-800 dark:text-gray-200`}
    >
      {Icon && <Icon className="text-green-600 w-8 h-8" />}

      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <p className="text-gray-600 mt-2 dark:text-gray-400">{description}</p>
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

export function SettingsCard({
  title,
  description,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gray-100 dark:bg-gray-700/20 py-4 px-6 rounded-lg shadow-md 
        w-[90%] sm:w-4/5 flex flex-col sm:flex-row space-y-4 sm:space-x-4 justify-between items-left sm:items-center 
        ${className}`}
    >
      <div className="flex items-start">
        {Icon && <Icon className="text-green-600 w-8 h-8" />}
        <div>
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
