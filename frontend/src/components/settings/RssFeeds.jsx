import React, { useEffect, useState } from "react";
import api from "../../api";
import { useRecoilValue } from "recoil";
import { newsfeedListState } from "../../App";
import { Button, Stack, TextField, Typography } from "@mui/material";

export default function RssFeeds() {
  const existing = useRecoilValue(newsfeedListState);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const handleAdd = async () => {
    if (!name || !url) return;
    setSubmitting(true);
    try {
      await api.post("/api/settings/modules/newsfeed/", {
        name,
        url,
        icon: "default",
        enabled: true,
      });
      setName("");
      setUrl("");
      // optional: refresh feeds list page
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Add custom RSS feed</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField label="Name" size="small" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="URL" size="small" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button variant="contained" disabled={submitting} onClick={handleAdd}>Add</Button>
      </Stack>
      <Typography variant="subtitle1">Existing feeds</Typography>
      <ul>
        {Object.keys(existing).map((k) => (
          <li key={k}>{k}: {existing[k].url}</li>
        ))}
      </ul>
    </Stack>
  );
}
