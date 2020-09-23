import React from "react";

import { Node } from "../App";
import Details from "./Details";

const SearchResults = ({ results }: { results: Node[] }) => {
  return (
    <div>
      <h3>Search results</h3>

      {results.map((node) => (
        <Details node={node} />
      ))}
    </div>
  );
};

export default SearchResults;
