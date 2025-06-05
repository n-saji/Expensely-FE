export default function Card({
  title,
  description,
  icon: Icon,
  className = "",
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 flex items-start space-x-4 ${className}`}
    >
      {Icon && <Icon className="text-green-600 w-8 h-8" />}
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
}
