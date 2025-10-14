interface SpinnerProps {
  size?: number;
  color?: string;
  borderWidth?: number;
}

export const Spinner = ({
  size = 40,
  color = 'border-gray-400',
  borderWidth = 4,
}: SpinnerProps) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${borderWidth}px`,
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent ${color}`}
      style={spinnerStyle}
    />
  );
};
