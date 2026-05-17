import React from "react";
import "../styles/visitorNotice.css";

interface Props {
  onGuestLogin: () => void;
  loading: boolean;
}

const VisitorNoticeLogin: React.FC<Props> = ({ onGuestLogin, loading }) => {
  return (
    <div className="visitor-notice">
      <p>
        <strong>Just visiting?</strong>
        <br />
        Log in as a guest to explore the app with example training data.
        <br />
        <em>Intended for visitors and recruiters.</em>
      </p>
      <button onClick={onGuestLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login as Guest"}
      </button>
    </div>
  );
};

export default VisitorNoticeLogin;
