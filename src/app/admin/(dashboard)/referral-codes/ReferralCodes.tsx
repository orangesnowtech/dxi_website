"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MEMBERSHIP_FEE_LABEL, MEMBERSHIP_FEE_NAIRA } from "@/lib/academy";
import {
  applyReferralDiscount,
  describeReferralDiscount,
  formatNaira,
  generateReferralCode,
  normalizeReferralCode,
  referralRejectionReason,
  type ReferralCode,
  type ReferralDiscountType,
} from "@/lib/referral";
import styles from "../../admin.module.css";

type FormState = {
  code: string;
  label: string;
  discountType: ReferralDiscountType;
  discountValue: string;
  maxUses: string;
  expiresAt: string;
};

const emptyForm: FormState = {
  code: "",
  label: "",
  discountType: "percent",
  discountValue: "0",
  maxUses: "",
  expiresAt: "",
};

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-NG") : "—";
}

/** Why a code is not usable right now, in the words the dashboard shows. */
function statusOf(code: ReferralCode) {
  const reason = referralRejectionReason(code, new Date());

  if (!reason) return { label: "Active", color: "#10b981" };
  if (reason === "paused") return { label: "Paused", color: "#6b7280" };
  if (reason === "expired") return { label: "Expired", color: "#ef4444" };
  return { label: "Limit reached", color: "#f59e0b" };
}

export default function ReferralCodes({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  /** Set while editing an existing code — its code is then read-only. */
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/referral-codes");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load referral codes");
      }

      setCodes(data.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  // Live echo of what the applicant will be charged, so a mistyped 1000%
  // discount is obvious before it is saved.
  const preview = useMemo(() => {
    const value = Number(form.discountValue || 0);

    if (!Number.isFinite(value) || value < 0) {
      return "Enter a discount of zero or more.";
    }

    if (form.discountType === "percent" && value > 100) {
      return "A percentage discount cannot be more than 100%.";
    }

    return describeReferralDiscount(form.discountType, value, MEMBERSHIP_FEE_NAIRA);
  }, [form.discountType, form.discountValue]);

  const handleGenerate = () => {
    // The label seeds the prefix, so a code for "Sales — Ada" starts SALES.
    const seed = form.label.split(/[\s-]+/)[0] || "DXI";
    setField("code", generateReferralCode(seed.slice(0, 8)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const body = {
      code: form.code,
      label: form.label,
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      maxUses: form.maxUses.trim() === "" ? null : Number(form.maxUses),
      expiresAt: form.expiresAt || null,
    };

    try {
      const response = await fetch(
        editing
          ? `/api/admin/referral-codes?code=${encodeURIComponent(editing)}`
          : "/api/admin/referral-codes",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save the referral code");
      }

      setNotice(data.message);
      resetForm();
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (code: ReferralCode) => {
    setEditing(code.code);
    setForm({
      code: code.code,
      label: code.label,
      discountType: code.discountType,
      discountValue: String(code.discountValue),
      maxUses: code.maxUses === null ? "" : String(code.maxUses),
      expiresAt: code.expiresAt || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (code: ReferralCode) => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/admin/referral-codes?code=${encodeURIComponent(code.code)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !code.active }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update the code");
      }

      setNotice(data.message);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (code: ReferralCode) => {
    const confirmed = window.confirm(
      `Delete ${code.code}?\n\nIt has never been used, so nothing is lost. Codes that have been used cannot be deleted — pause those instead.`
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/admin/referral-codes?code=${encodeURIComponent(code.code)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete the code");
      }

      setNotice(data.message);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to the clipboard. Select the code and copy it manually.");
    }
  };

  const totals = useMemo(
    () =>
      codes.reduce(
        (acc, code) => {
          const { discountNaira } = applyReferralDiscount(
            code.discountType,
            code.discountValue,
            MEMBERSHIP_FEE_NAIRA
          );

          return {
            uses: acc.uses + (code.usageCount || 0),
            approved: acc.approved + (code.approvedCount || 0),
            discounted: acc.discounted + discountNaira * (code.approvedCount || 0),
          };
        },
        { uses: 0, approved: 0, discounted: 0 }
      ),
    [codes]
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Referral Codes</h1>
          <p className={styles.subtitle}>
            A code with no discount attributes a signup to whoever handed it out — give one
            to each sales rep with no usage limit to track their output. A code with a
            discount, up to a full 100%, is how a place is given as a gift or sold at a
            promotional rate off the {MEMBERSHIP_FEE_LABEL} membership.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <form onSubmit={handleSubmit} className={styles.codeForm}>
          <h2 className={styles.codeFormTitle}>
            {editing ? `Edit ${editing}` : "Create a code"}
          </h2>

          <div className={styles.codeFormGrid}>
            <div className={styles.codeField}>
              <label htmlFor="code">Code</label>
              <div className={styles.codeInputRow}>
                <input
                  id="code"
                  value={form.code}
                  onChange={(event) => setField("code", normalizeReferralCode(event.target.value))}
                  placeholder="GIFT-K7P2QM"
                  required
                  // The code is the key applicants type and submissions point
                  // at, so it is fixed once the code exists.
                  disabled={Boolean(editing)}
                  className={styles.grantInput}
                />
                {!editing && (
                  <button type="button" onClick={handleGenerate} className={styles.generateBtn}>
                    Generate
                  </button>
                )}
              </div>
              <span className={styles.codeHint}>
                Letters, numbers and dashes. Uppercased automatically.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="label">Who it belongs to</label>
              <input
                id="label"
                value={form.label}
                onChange={(event) => setField("label", event.target.value)}
                placeholder="Ada — sales team, or: gift from Chris"
                required
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>Internal only. Applicants never see this.</span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="discountType">Discount</label>
              <div className={styles.codeInputRow}>
                <select
                  id="discountType"
                  value={form.discountType}
                  onChange={(event) => setField("discountType", event.target.value)}
                  className={styles.select}
                >
                  <option value="percent">% off</option>
                  <option value="amount">₦ off</option>
                </select>
                <input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={form.discountType === "percent" ? "1" : "500"}
                  max={form.discountType === "percent" ? "100" : undefined}
                  value={form.discountValue}
                  onChange={(event) => setField("discountValue", event.target.value)}
                  className={styles.grantInput}
                />
              </div>
              <span className={styles.codeHint}>{preview}</span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="maxUses">Usage limit</label>
              <input
                id="maxUses"
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={(event) => setField("maxUses", event.target.value)}
                placeholder="Unlimited"
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                Leave blank for unlimited — that is the shape to use for a sales rep.
              </span>
            </div>

            <div className={styles.codeField}>
              <label htmlFor="expiresAt">Expires on</label>
              <input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setField("expiresAt", event.target.value)}
                className={styles.grantInput}
              />
              <span className={styles.codeHint}>
                Blank never expires. Usable through the end of the chosen day.
              </span>
            </div>
          </div>

          <div className={styles.codeFormActions}>
            <button type="submit" disabled={busy} className={styles.loginBtn}>
              {busy ? "Saving…" : editing ? "Save changes" : "Create code"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className={styles.paginationBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {!loading && codes.length > 0 && (
          <div className={styles.stats}>
            <span>
              Codes: <strong>{codes.length}</strong>
            </span>
            <span>
              Signups: <strong>{totals.uses}</strong>
            </span>
            <span>
              Approved: <strong>{totals.approved}</strong>
            </span>
            <span>
              Discount given: <strong>{formatNaira(totals.discounted)}</strong>
            </span>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading referral codes…</div>
        ) : codes.length === 0 ? (
          <div className={styles.empty}>
            No referral codes yet. Create one above and it works on the business profile form
            straight away.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Belongs to</th>
                  <th>Discount</th>
                  <th>Used</th>
                  <th>Approved</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => {
                  const status = statusOf(code);

                  return (
                    <tr key={code.code} className={styles.row}>
                      <td className={styles.name}>
                        <button
                          type="button"
                          onClick={() => handleCopy(code.code)}
                          className={styles.copyCodeBtn}
                          title="Copy this code"
                        >
                          {copied === code.code ? "Copied ✓" : code.code}
                        </button>
                      </td>
                      <td>{code.label}</td>
                      <td>
                        {describeReferralDiscount(
                          code.discountType,
                          code.discountValue,
                          MEMBERSHIP_FEE_NAIRA
                        )}
                      </td>
                      <td>
                        {code.usageCount || 0}
                        {code.maxUses === null ? " / ∞" : ` / ${code.maxUses}`}
                      </td>
                      <td>{code.approvedCount || 0}</td>
                      <td>{code.expiresAt ? formatDate(code.expiresAt) : "Never"}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button
                            onClick={() => handleEdit(code)}
                            disabled={busy}
                            className={styles.viewDetailsBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(code)}
                            disabled={busy}
                            className={styles.paginationBtn}
                          >
                            {code.active ? "Pause" : "Resume"}
                          </button>
                          {isSuperAdmin && (code.usageCount || 0) === 0 && (
                            <button
                              onClick={() => handleDelete(code)}
                              disabled={busy}
                              className={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
