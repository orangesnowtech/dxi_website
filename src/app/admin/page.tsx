"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

type SocialMediaProfile = {
  platform: string;
  url: string;
};

type Submission = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  preferredContactMethod: string;
  businessOffering: string;
  businessDescription: string;
  country: string;
  state: string;
  cityOrArea: string;
  hasPhysicalLocation: string;
  locationType?: string;
  isBusinessRunning: string;
  businessDuration: string;
  isFullTimeBusiness: string;
  businessTypeIfNotFullTime?: string;
  isBusinessRegistered: string;
  needsRegistrationHelp?: string;
  hasStaff: string;
  staffCount?: string;
  isMakingSales: string;
  monthlyRevenue: string;
  salesChannels: string;
  onSocialMedia: string;
  socialMediaProfiles?: SocialMediaProfile[];
  wantsBusinessSupport: string;
  hasWebsite: string;
  websiteUrl?: string;
  supportAreaNeeded?: string;
  businessGoalsNextSixMonths?: string;
  preferredContactDay?: string;
  preferredContactTime?: string;
  status: "new" | "contacted" | "qualified" | "rejected" | "archived";
  createdAt: string;
  submittedAt: string;
};

const statusColors: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  qualified: "#10b981",
  rejected: "#ef4444",
  archived: "#6b7280",
};

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, page]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/submissions?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      setSubmissions(data.submissions);
      setTotalCount(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      setUpdatingId(submissionId);

      const response = await fetch(`/api/admin/submissions?id=${submissionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update submission status");
      }

      // Update local state
      setSubmissions(
        submissions.map((sub) =>
          sub.id === submissionId ? { ...sub, status: newStatus as any } : sub
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p className={styles.subtitle}>Business Profile Submissions</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className={styles.stats}>
            <span>
              Total: <strong>{totalCount}</strong>
            </span>
            <span>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className={styles.empty}>No submissions found</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business</th>
                    <th>Location</th>
                    <th>Monthly Revenue</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className={styles.row}>
                      <td className={styles.name}>{submission.fullName}</td>
                      <td>
                        <a href={`mailto:${submission.emailAddress}`}>
                          {submission.emailAddress}
                        </a>
                      </td>
                      <td>
                        <a href={`tel:${submission.phoneNumber}`}>
                          {submission.phoneNumber}
                        </a>
                      </td>
                      <td className={styles.business}>
                        {submission.businessOffering}
                      </td>
                      <td>
                        {submission.cityOrArea}, {submission.state}
                      </td>
                      <td>{submission.monthlyRevenue}</td>
                      <td>
                        <select
                          value={submission.status}
                          onChange={(e) =>
                            handleStatusChange(submission.id, e.target.value)
                          }
                          disabled={updatingId === submission.id}
                          className={styles.statusSelect}
                          style={{
                            borderColor: statusColors[submission.status],
                          }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="rejected">Rejected</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td>
                        {new Date(submission.submittedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className={styles.viewDetailsBtn}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className={styles.paginationBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= totalPages}
                className={styles.paginationBtn}
              >
                Next
              </button>
            </div>
          </>
        )}

        {selectedSubmission && (
          <div className={styles.modalOverlay} onClick={() => setSelectedSubmission(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className={styles.closeBtn}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.submissionGrid}>
                  <div className={styles.section}>
                    <h3>Personal Information</h3>
                    <div className={styles.field}>
                      <label>Full Name</label>
                      <p>{selectedSubmission.fullName}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Email</label>
                      <p>
                        <a href={`mailto:${selectedSubmission.emailAddress}`}>
                          {selectedSubmission.emailAddress}
                        </a>
                      </p>
                    </div>
                    <div className={styles.field}>
                      <label>Phone</label>
                      <p>
                        <a href={`tel:${selectedSubmission.phoneNumber}`}>
                          {selectedSubmission.phoneNumber}
                        </a>
                      </p>
                    </div>
                    <div className={styles.field}>
                      <label>Preferred Contact Method</label>
                      <p>{selectedSubmission.preferredContactMethod}</p>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3>Location</h3>
                    <div className={styles.field}>
                      <label>Country</label>
                      <p>{selectedSubmission.country}</p>
                    </div>
                    <div className={styles.field}>
                      <label>State/Province</label>
                      <p>{selectedSubmission.state}</p>
                    </div>
                    <div className={styles.field}>
                      <label>City/Area</label>
                      <p>{selectedSubmission.cityOrArea}</p>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3>Business Information</h3>
                    <div className={styles.field}>
                      <label>Business Offering</label>
                      <p>{selectedSubmission.businessOffering}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Business Description</label>
                      <p className={styles.multiline}>
                        {selectedSubmission.businessDescription}
                      </p>
                    </div>
                    <div className={styles.field}>
                      <label>Physical Location</label>
                      <p>{selectedSubmission.hasPhysicalLocation}</p>
                    </div>
                    {selectedSubmission.locationType && (
                      <div className={styles.field}>
                        <label>Location Type</label>
                        <p>{selectedSubmission.locationType}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.section}>
                    <h3>Business Status</h3>
                    <div className={styles.field}>
                      <label>Is Business Running</label>
                      <p>{selectedSubmission.isBusinessRunning}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Business Duration</label>
                      <p>{selectedSubmission.businessDuration}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Is Full-Time Business</label>
                      <p>{selectedSubmission.isFullTimeBusiness}</p>
                    </div>
                    {selectedSubmission.businessTypeIfNotFullTime && (
                      <div className={styles.field}>
                        <label>Business Type (If Not Full-Time)</label>
                        <p>{selectedSubmission.businessTypeIfNotFullTime}</p>
                      </div>
                    )}
                    <div className={styles.field}>
                      <label>Business Registered</label>
                      <p>{selectedSubmission.isBusinessRegistered}</p>
                    </div>
                    {selectedSubmission.needsRegistrationHelp && (
                      <div className={styles.field}>
                        <label>Needs Registration Help</label>
                        <p>{selectedSubmission.needsRegistrationHelp}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.section}>
                    <h3>Staffing & Sales</h3>
                    <div className={styles.field}>
                      <label>Has Staff</label>
                      <p>{selectedSubmission.hasStaff}</p>
                    </div>
                    {selectedSubmission.staffCount && (
                      <div className={styles.field}>
                        <label>Staff Count</label>
                        <p>{selectedSubmission.staffCount}</p>
                      </div>
                    )}
                    <div className={styles.field}>
                      <label>Making Sales</label>
                      <p>{selectedSubmission.isMakingSales}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Monthly Revenue</label>
                      <p>{selectedSubmission.monthlyRevenue}</p>
                    </div>
                    <div className={styles.field}>
                      <label>Sales Channels</label>
                      <p>{selectedSubmission.salesChannels}</p>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3>Online Presence</h3>
                    <div className={styles.field}>
                      <label>On Social Media</label>
                      <p>{selectedSubmission.onSocialMedia}</p>
                    </div>
                    {selectedSubmission.socialMediaProfiles &&
                      selectedSubmission.socialMediaProfiles.length > 0 && (
                        <div className={styles.field}>
                          <label>Social Media Profiles</label>
                          <ul className={styles.socialList}>
                            {selectedSubmission.socialMediaProfiles.map(
                              (profile, index) => (
                                <li key={index}>
                                  <strong>{profile.platform}:</strong>{" "}
                                  <a
                                    href={profile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {profile.url}
                                  </a>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    <div className={styles.field}>
                      <label>Has Website</label>
                      <p>{selectedSubmission.hasWebsite}</p>
                    </div>
                    {selectedSubmission.websiteUrl && (
                      <div className={styles.field}>
                        <label>Website URL</label>
                        <p>
                          <a
                            href={selectedSubmission.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {selectedSubmission.websiteUrl}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedSubmission.wantsBusinessSupport === "Yes" && (
                    <div className={styles.section}>
                      <h3>Business Support Request</h3>
                      <div className={styles.field}>
                        <label>Support Area Needed</label>
                        <p>{selectedSubmission.supportAreaNeeded}</p>
                      </div>
                      <div className={styles.field}>
                        <label>Business Goals (Next 6 Months)</label>
                        <p className={styles.multiline}>
                          {selectedSubmission.businessGoalsNextSixMonths}
                        </p>
                      </div>
                      <div className={styles.field}>
                        <label>Preferred Contact Day</label>
                        <p>{selectedSubmission.preferredContactDay}</p>
                      </div>
                      <div className={styles.field}>
                        <label>Preferred Contact Time</label>
                        <p>{selectedSubmission.preferredContactTime}</p>
                      </div>
                    </div>
                  )}

                  <div className={styles.section}>
                    <h3>Submission Details</h3>
                    <div className={styles.field}>
                      <label>Status</label>
                      <p>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: statusColors[selectedSubmission.status],
                          }}
                        >
                          {selectedSubmission.status}
                        </span>
                      </p>
                    </div>
                    <div className={styles.field}>
                      <label>Submitted At</label>
                      <p>
                        {new Date(
                          selectedSubmission.submittedAt
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className={styles.closeModalBtn}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
