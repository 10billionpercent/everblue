"use client";

import { useState } from "react";
import { uploadTestFile } from "@/jagannatha/actions";

export default function TestStorage() {
  const [message, setMessage] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("Uploading...");

    const key = await uploadTestFile(file);

    setMessage(`Uploaded: ${key}`);
  }

  return (
    <main
      style={{
        backgroundColor: "black",
        color: "white",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1>B2 test</h1>

      <input type="file" onChange={handleUpload} />

      <p>{message}</p>
    </main>
  );
}
