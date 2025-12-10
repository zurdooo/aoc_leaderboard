import './styles/ErrorCard.css';

type Props = {
  title?: string;
  message: string;
  onClose?: () => void;
};

export default function ErrorCard({
  title = "Login Error",
  message,
  onClose,
}: Props) {
  return (
    <div className="error-card" role="alert">
      <div className="error-card-header">
        <strong>{title}</strong>
        {onClose && (
          <button className="close" aria-label="Close" onClick={onClose}>
            x
          </button>
        )}
      </div>
      <div className="error-card-body">{message}</div>
    </div>
  );
}
