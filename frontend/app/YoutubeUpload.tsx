"use client";

import React from "react";

export default function YoutubeUpload() {
  const [link, setLink] = React.useState("");
  return (
    <form className="w-full">
      <label htmlFor="ytb-link"></label>
      <input
        className="border-2 border-gray-300 rounded-md p-2 w-full text-center"
        type="url"
        id="ytb-link"
        name="ytb-link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Or insert a YouTube link"
      />
    </form>
  );
}
