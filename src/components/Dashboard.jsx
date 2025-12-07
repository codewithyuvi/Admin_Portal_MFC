import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./authContext";
import Cookies from "js-cookie";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiLoader,
  FiExternalLink,
} from "react-icons/fi";

const InterviewPortal = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const { authenticated } = useContext(AuthContext);

  const handleSearch = async () => {
    if (!regNo.trim()) {
      setError("Please enter a registration number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("jwtToken");
      if (!token) throw new Error("JWT token not found");

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/admin/response/`,
        {
          regNo: regNo,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (result.success && result.data && result.data.length > 0) {
        setUserData(result.data[0]);
      } else {
        setError("No candidate found with this registration number");
      }
    } catch (err) {
      setError("Failed to fetch candidate data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMemberStatusBadge = (userData) => {
    if (!userData) return null;

    console.log(userData._id);
    // console.log(userData.roundOne);

    let status = "Regular Member";
    let colorClass = "status-regular";

    if (userData.isSC) {
      status = "Senior Core";
      colorClass = "status-senior";
    } else if (userData.isJC) {
      status = "Junior Core";
      colorClass = "status-junior";
    }

    return <span className={`status-badge ${colorClass}`}>{status}</span>;
  };

  const renderCandidateDetails = () => {
    if (!userData) return null;

    return (
      <div className="details-section card">
        <div className="candidate-header">
          <div className="candidate-avatar">
            {userData.username
              ? userData.username.charAt(0).toUpperCase()
              : "C"}
          </div>
          <div className="candidate-identity">
            <h2>{userData.username || "Unnamed Candidate"}</h2>
            <div className="candidate-meta">
              <span className="reg-number">{userData.regno || regNo}</span>
              {getMemberStatusBadge(userData)}
            </div>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <FiMail className="detail-icon" />
            <div className="detail-content">
              <label>College Email</label>
              <p>{userData.email || "Not provided"}</p>
            </div>
          </div>

          <div className="detail-item">
            <FiMail className="detail-icon" />
            <div className="detail-content">
              <label>Personal Email</label>
              <p>{userData.emailpersonal || "Not provided"}</p>
            </div>
          </div>

          <div className="detail-item">
            <FiPhone className="detail-icon" />
            <div className="detail-content">
              <label>Mobile</label>
              <p>{userData.mobile || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="involvement-section">
          <h3>Club Involvement</h3>
          <div className="involvement-grid">
            <div className="involvement-item">
              <label>Participated Events</label>
              {userData.participatedEvent ? (
                <div className="event-tags">
                  {userData.participatedEvent.split(",").map((event, idx) => (
                    <span key={idx} className="event-tag">
                      {event.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data">None</p>
              )}
            </div>

            <div className="involvement-item">
              <label>Volunteered Events</label>
              {userData.volunteeredEvent ? (
                <div className="event-tags">
                  {userData.volunteeredEvent.split(",").map((event, idx) => (
                    <span key={idx} className="event-tag">
                      {event.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data">None</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDomains = () => {
    if (!userData || !userData.domain || userData.domain.length === 0)
      return null;

    return (
      <div className="domains-section card">
        <h3>Applied Domains</h3>
        <div className="domains-list">
          {userData.domain.map((domain, index) => {
            const domainClass = `domain-${domain.toLowerCase()}`;
            return (
              <div key={index} className={`domain-badge ${domainClass}`}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDomainAnswers = () => {
    if (!userData) return null;

    const tasks = [
      { domain: "tech", tasks: userData.techTasks || [] },
      { domain: "design", tasks: userData.designTasks || [] },
      { domain: "management", tasks: userData.managementTasks || [] },
    ];

    const filteredTasks = tasks.filter(
      (task) => task.tasks && task.tasks.length > 0
    );

    if (filteredTasks.length === 0) return null;

    return (
      <>
        {filteredTasks.map((domainTask, index) => (
          <div
            key={index}
            className={`domain-answers card domain-${domainTask.domain}`}
          >
            <div className="domain-header">
              <h3>
                {domainTask.domain.charAt(0).toUpperCase() +
                  domainTask.domain.slice(1)}{" "}
                Domain Responses
              </h3>
            </div>
            {domainTask.tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="task-container">
                {task.subdomain && task.subdomain.length > 0 && (
                  <div className="subdomain">
                    <h4>Subdomain</h4>
                    <div className="subdomain-tags">
                      {task.subdomain.flatMap((sub, subIdx) => {
                        if (sub.includes(",")) {
                          return sub
                            .split(",")
                            .map((subItem, itemIdx) => {
                              const trimmedItem = subItem.trim();
                              return trimmedItem ? (
                                <span
                                  key={`${subIdx}-${itemIdx}`}
                                  className="subdomain-tag"
                                >
                                  {trimmedItem.charAt(0).toUpperCase() +
                                    trimmedItem.slice(1)}
                                </span>
                              ) : null;
                            })
                            .filter(Boolean);
                        }
                        return (
                          <span key={subIdx} className="subdomain-tag">
                            {sub.charAt(0).toUpperCase() + sub.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {task.question1 &&
                  Array.isArray(task.question1) &&
                  task.question1.length >= 2 && (
                    <div className="portfolio-section">
                      <h4>Tasks</h4>
                      <div className="question-card">
                        <div className="question-header portfolio-header">
                          <p className="question-text">Submitted Tasks</p>
                        </div>
                        <div className="answer-container">
                          <p className="answer">
                            {linkifyText(task.question1[1])}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="other-questions">
                  <h4>Technical Questions</h4>
                  <div className="questions-grid">
                    {[
                      "question2",
                      "question3",
                      "question4",
                      "question5",
                      "question6",
                      "question7",
                      "question8",
                      "question9",
                      "question10",
                      "question11",
                      "question12",
                      "question13",
                      "question14",
                      "question15",
                      "question16",
                      "question17",
                    ].map((qKey, qIndex) =>
                      task[qKey] &&
                      Array.isArray(task[qKey]) &&
                      task[qKey].length >= 2 ? (
                        <div key={qIndex} className="question-card">
                          <div className="question-header">
                            <span className="question-number">
                              Q{qIndex + 1}
                            </span>
                            <p className="question-text">{task[qKey][0]}</p>
                          </div>
                          <div className="answer-container">
                            <p className="answer">{task[qKey][1]}</p>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div>
              <p>Current Level: {userData[domainTask.domain]}</p>

              <button
                onClick={() => handleAcceptRounds(domainTask.domain)}
                disabled={userData[domainTask.domain] >= 3}
              >
                Promote to Next Round
              </button>

              <button
                onClick={() => handleRejectRounds(domainTask.domain)}
                disabled={userData[domainTask.domain] === 0}
              >
                Reject (Reset to 0)
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };

  const handleAcceptRounds = async (domain) => {
    try {
      const token = Cookies.get("jwtToken");
      if (!token) throw new Error("JWT token not found");

      const updatedLevels = {
        tech: userData.tech,
        design: userData.design,
        management: userData.management,
      };

      updatedLevels[domain] = updatedLevels[domain] + 1;

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/updatestatus/${userData._id}`,
        {
          regno: userData.regno,
          ...updatedLevels,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      await handleSearch();
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRejectRounds = async (domain) => {
    try {
      const token = Cookies.get("jwtToken");
      if (!token) throw new Error("JWT token not found");

      const updatedLevels = {
        tech: userData.tech,
        design: userData.design,
        management: userData.management,
      };

      updatedLevels[domain] = 0; 

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/updatestatus/${userData._id}`,
        {
          regno: userData.regno,
          ...updatedLevels,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      await handleSearch();
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const renderTabs = () => {
    if (!userData) return null;

    return (
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Candidate Profile
          </button>
          <button
            className={`tab ${activeTab === "responses" ? "active" : ""}`}
            onClick={() => setActiveTab("responses")}
          >
            Application Responses
          </button>
        </div>
      </div>
    );
  };

  const linkifyText = (text) => {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      const url = match[0];
      elements.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          {url} <FiExternalLink className="link-icon" />
        </a>
      );

      lastIndex = match.index + url.length;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return <>{elements}</>;
  };

  return (
    <div className="interview-portal">
      <div className="portal-header">
        <div className="logo">
          <div className="logo-icon">RP</div>
          <h1>Recruitment Admin Portal</h1>
        </div>

        {!authenticated && (
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      <div className="search-container card">
        <div className="search-section">
          <div className="input-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Enter Registration Number (e.g., 21BCS1234)"
              value={regNo}
              onChange={(e) => {
                const uppercaseValue = e.target.value.toUpperCase();
                setRegNo(uppercaseValue);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={!validateRegNo(regNo) && regNo ? "invalid" : ""}
            />
            {regNo && !validateRegNo(regNo) && (
              <div className="validation-hint">
                Format: YYBXX0000 (YY: 21-24, B: Branch, XX: Dept)
              </div>
            )}
          </div>
          <button
            className={`search-button ${loading ? "loading" : ""}`}
            onClick={handleSearch}
            disabled={loading || !validateRegNo(regNo)}
          >
            {loading ? <FiLoader className="spin" /> : <span>Search</span>}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}
      </div>

      {userData && renderTabs()}

      {userData && (
        <div className="candidate-data">
          {activeTab === "details" ? (
            <>
              {renderCandidateDetails()}
              {renderDomains()}
            </>
          ) : (
            renderDomainAnswers()
          )}
        </div>
      )}
    </div>
  );
};

const validateRegNo = (regNo) => {
  const regNoPattern = /^(21|22|23|24)[BM][A-Z]{2}\d{4}$/;
  return regNoPattern.test(regNo);
};

export default InterviewPortal;
