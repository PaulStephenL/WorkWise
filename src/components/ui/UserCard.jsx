export function Card({ className, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={`p-4 pt-0 ${className}`} {...props} />;
} 