interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card-elevated p-5 ${className}`}>
      {children}
    </div>
  );
}
