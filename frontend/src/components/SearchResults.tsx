import React, { useEffect, useRef } from "react";
import Mark from "mark.ts";

import { Node } from "../App";
import Details from "./Details";

export interface SearchResult {
  query: string;
  results: Node[];
}

const SearchResults = ({ data }: { data: SearchResult }) => {
  const { results, query } = data;

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!!containerRef.current) {
      const markInstance = new Mark(containerRef.current);
      markInstance.mark(query.split(" "), {});
    }
  }, [query, containerRef]);

  return (
    <div className="search-results" ref={containerRef}>
      <h3>Search results</h3>

      {results.map((node) => (
        <Details node={node} key={node.id} />
      ))}

      {results.length < 1 && (
        <p>
          There are no contents that match what you're looking for{" "}
          <span role="img" aria-label="Shrug">
            🤷‍♂️
          </span>
        </p>
      )}
    </div>
  );
};

export default SearchResults;
