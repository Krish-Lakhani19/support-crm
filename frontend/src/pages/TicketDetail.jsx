import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi } from "../api/client";
import StatusBadge, { PriorityBadge } from "../components/StatusBadge";

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-[#484f58] uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm text-[#e6edf3] ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Support Agent");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ticketsApi.get(ticketId);
      setTicket(res.data);
      setNewStatus(res.data.status);
      setNewPriority(res.data.priority);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Ticket ${ticketId} was not found.`);
      } else {
        setError("Failed to load ticket.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!newStatus && !noteText.trim()) return;

    setSaving(true);
    try {
      const payload = {
        status: newStatus || undefined,
        priority: newPriority || undefined,
      };
      if (noteText.trim()) {
        payload.note_text = noteText.trim();
        payload.note_author = noteAuthor.trim() || "Support Agent";
      }
      await ticketsApi.update(ticketId, payload);
      setNoteText("");
      setSaveSuccess(true);
      await fetchTicket();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError("Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ticketsApi.delete(ticketId);
      navigate("/");
    } catch (err) {
      setSaveError("Failed to delete ticket.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-[#8b949e] text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading ticket...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-[#8b949e] text-sm">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-[#2f81f7] hover:underline text-sm"
        >
          Back to all tickets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-[#30363d] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
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
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[#2f81f7] text-sm font-medium">
                {ticket.ticket_id}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-[#e6edf3] font-semibold text-base mt-0.5">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-[#8b949e] hover:text-red-400 border border-[#30363d] hover:border-red-400/30 rounded px-3 py-1.5 transition-colors duration-150"
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Confirm delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 rounded px-3 py-1.5 transition-colors duration-150 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded px-3 py-1.5 transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-0 h-full">
          <div className="col-span-2 border-r border-[#30363d] overflow-y-auto">
            <div className="px-6 py-5">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-5">
                <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3">
                  Description
                </h2>
                <p className="text-[#e6edf3] text-sm leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              <div>
                <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3">
                  Activity ({ticket.notes.length})
                </h2>

                {ticket.notes.length === 0 ? (
                  <p className="text-[#484f58] text-sm py-4">No notes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {ticket.notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#e6edf3]">
                            {note.author}
                          </span>
                          <span className="text-xs text-[#484f58]">
                            {formatDateTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-[#8b949e] leading-relaxed whitespace-pre-wrap">
                          {note.note_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto">
            <div className="px-5 py-5 space-y-5">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
                <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                  Customer
                </h2>
                <InfoRow label="Name" value={ticket.customer_name} />
                <InfoRow label="Email" value={ticket.customer_email} />
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
                <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                  Metadata
                </h2>
                <InfoRow label="Ticket ID" value={ticket.ticket_id} mono />
                <InfoRow label="Created" value={formatDateTime(ticket.created_at)} />
                <InfoRow label="Last Updated" value={formatDateTime(ticket.updated_at)} />
              </div>

              <form
                onSubmit={handleUpdate}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3"
              >
                <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                  Update Ticket
                </h2>

                {saveError && (
                  <p className="text-red-400 text-xs">{saveError}</p>
                )}
                {saveSuccess && (
                  <p className="text-emerald-400 text-xs">Ticket updated.</p>
                )}

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1.5">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm px-3 py-2 focus:outline-none focus:border-[#2f81f7] transition-colors duration-150"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm px-3 py-2 focus:outline-none focus:border-[#2f81f7] transition-colors duration-150"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1.5">
                    Add Note
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Add a note or update..."
                    className="w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm px-3 py-2 placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] transition-colors duration-150 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8b949e] mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] text-sm px-3 py-2 placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] transition-colors duration-150"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#2f81f7] hover:bg-[#388bfd] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
