import React from "react";

export default function Mixer(props: { track: ProcessedTrack }) {
  const { track } = props;
  const { name, artist, model, codec, bitRate, parts, midi } = track;
  const { vocal, bass, other, piano, drums } = parts;
  return (
    <div>
      <h2>{name}</h2>
      <h3>{artist}</h3>
      <h4>{model}</h4>
      <h5>{codec}</h5>
      <h6>{bitRate}</h6>
      <div>
        <h2>Vocal</h2>
        <audio controls src={vocal}></audio>
      </div>
    </div>
  );
}
