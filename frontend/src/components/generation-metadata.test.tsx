import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GenerationMetadata } from "@/components/generation-metadata";

describe("generation metadata timestamps", () => {
  it.each([
    ["2026-10-26T17:08:56.175251", "2026-10-26T17:08:56.175251Z"],
    ["2026-10-26T17:08:56Z", "2026-10-26T17:08:56Z"],
    ["2026-10-27T01:08:56+08:00", "2026-10-27T01:08:56+08:00"],
  ])("interprets the saved instant correctly for %s", (value, expected) => {
    render(<GenerationMetadata generationMode="live" generatedAt={value} />);
    const time = document.querySelector("time");
    expect(time).toHaveAttribute("dateTime", expected);
    expect(time).toHaveTextContent(new Date(expected).toLocaleString("zh-CN"));
  });
});
