import React from "react";
import "../styles/visitorNotice.css";

const VisitorNoticeLogin: React.FC = () => {
  return (
    <div className="visitor-notice">
      <p>
        <strong>Just visiting and want to see some example data? Please use:</strong>
        <br />
        Email: <span className="highlight">mvr@gmail.com</span>
        <br />
        Password: <span className="highlight">ironman</span>
      </p>
    </div>
  );
};

export default VisitorNoticeLogin;
