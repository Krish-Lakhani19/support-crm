import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsApi } from "../api/client";

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#484f58] mt-1.5">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm px-3 py-2.5 placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] transition-colors duration-150";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
    priority: "Medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.subject.trim() || !form.description.trim()) {
      setError("All required fields must be filled in.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await ticketsApi.create(form);
      navigate(`/tickets/${res.data.ticket_id}`);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-[#30363d] px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-[#e6edf3] font-semibold text-lg">New Ticket</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">
            Open a new customer support ticket
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl">
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
              <h2 className="text-[#e6edf3] text-sm font-semibold mb-4 pb-3 border-b border-[#30363d]">
                Customer Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className={inputClass}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className={inputClass}
                    autoComplete="off"
                  />
                </Field>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
              <h2 className="text-[#e6edf3] text-sm font-semibold mb-4 pb-3 border-b border-[#30363d]">
                Issue Details
              </h2>
              <div className="space-y-4">
                <Field label="Subject" required hint="Brief summary of the issue">
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Unable to log in to account"
                    className={inputClass}
                  />
                </Field>

                <Field label="Description" required hint="Provide as much detail as possible">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the issue in detail..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <Field label="Priority">
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#2f81f7] hover:bg-[#388bfd] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded transition-colors duration-150"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm text-[#8b949e] hover:text-[#e6edf3] px-4 py-2.5 rounded border border-[#30363d] hover:border-[#484f58] transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
