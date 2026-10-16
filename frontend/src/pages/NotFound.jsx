import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="center-page"><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button primary" to="/dashboard">Back to dashboard</Link></div>;
}