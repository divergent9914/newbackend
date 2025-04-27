import { Link } from 'wouter';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <a className="back-home-link">Go back to Dashboard</a>
      </Link>
    </div>
  );
};

export default NotFound;