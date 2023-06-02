import React from "react";

export default function Page({
  params: { trackId },
}: {
  params: { trackId: string };
}) {
  return <div>{trackId}</div>;
}
