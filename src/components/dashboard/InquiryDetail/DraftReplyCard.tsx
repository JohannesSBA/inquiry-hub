"use client";

import { useEffect, useState } from "react";
import styles from "../Dashboard.module.css";

export function DraftReplyCard({
  inquiryId,
  draft,
  processing,
  onSaveDraft,
  onSend,
}: {
  inquiryId: string;
  draft: string;
  processing: boolean;
  onSaveDraft: (id: string, text: string) => Promise<void>;
  onSend: (id: string, text: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft);

  useEffect(() => {
    setText(draft);
  }, [draft, inquiryId]);

  async function save() {
    await onSaveDraft(inquiryId, text);
    setEditing(false);
  }

  return (
    <div className={styles.draftCard}>
      <div className={styles.draftTitle}>Draft reply</div>
      {editing ? (
        <textarea
          className={styles.searchInput}
          style={{ width: "100%", minHeight: 140, resize: "vertical" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <div className={styles.draftBody}>{draft}</div>
      )}
      <div className={styles.draftActions}>
        <button
          type="button"
          className={styles.sendBtn}
          disabled={processing}
          onClick={() => void onSend(inquiryId, editing ? text : draft)}
        >
          Send reply →
        </button>
        {editing ? (
          <>
            <button type="button" className={styles.editBtn} onClick={() => void save()}>
              Save
            </button>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => {
                setText(draft);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
