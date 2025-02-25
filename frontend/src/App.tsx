import ky from "ky";
import c from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";

import Details from "./components/Details";
import SearchResults, { SearchResult } from "./components/SearchResults";
import { byId } from "./utils";

import "./normalize.css";
import "./index.css";

const apiUrl = process.env.API_URL ? process.env.API_URL : '';

interface ImageContent {
  type: "image";
  url: string;
}

interface TextContent {
  type: "text";
  body: string;
}

export interface Node {
  id: number;
  title: string;
  connections?: number[];
  content?: Array<TextContent | ImageContent>;
}

interface NodesById {
  [id: string]: Node;
}

const getNodes = (nodesById: NodesById, ids: number[]) => {
  return ids.map((id) => nodesById[id]);
};

interface NodeItemProps {
  activePath: string;
  path: number[];
  node: Node;
  onClick: (id: number, path: number[]) => void;
  depth?: number;
  getConnections: (ids: number[]) => Node[];
}

const NodeItem = ({
  activePath,
  path,
  node,
  onClick,
  depth = 0,
  getConnections,
}: NodeItemProps) => {
  const { id, title, connections } = node;
  const [isOpen, setIsOpen] = useState(path.join("-") === activePath);

  useEffect(() => {
    if (!!activePath) {
      setIsOpen(activePath.startsWith(path.join("-")));
    }
  }, [activePath, path]);

  const isActive = activePath === path.join("-");

  return (
    <div key={id} className={c(`node depth-${depth}`, { isOpen, isActive })}>
      <button
        onClick={() => {
          onClick(id, path);
        }}
      >
        {title}
      </button>
      {isOpen &&
        depth < 2 &&
        getConnections(connections || []).map((n) => {
          return (
            <NodeItem
              activePath={activePath}
              path={[...path, n.id]}
              node={n}
              onClick={onClick}
              depth={depth + 1}
              getConnections={getConnections}
              key={n.id}
            />
          );
        })}
    </div>
  );
};

function App() {
  const [nodesById, setNodesById] = useState<NodesById>({});
  const [activeNodeIdPath, setActiveNodeIdPath] = useState<number[]>([]);
  const activeNodeId = activeNodeIdPath[activeNodeIdPath.length - 1];

  // Search
  const [showSearchResults, setShowResults] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult>({
    query: "",
    results: [],
  });

  const fetchNode = async (id: number) => {
    // This endpoint returns an array that contains only one node
    const [fetchedNode] = await ky.get(`${apiUrl}/nodes/${id}`).json();
    console.assert(fetchNode.length === 1);

    setNodesById((prev) => ({
      ...prev,
      [fetchedNode.id]: fetchedNode,
    }));
  };

  const search = async (query: string) => {
    const results: Node[] = await ky
      .post(`${apiUrl}/nodes/search`, { json: { query } })
      .json();
    setSearchResults({ query, results });
    setShowResults(true);
  };

  // Fire request 500ms after user stops typing instead of firing the request
  // every keystroke
  const debouncedSearch = useMemo(() => debounce(search, 500), []);

  useEffect(() => {
    const fetchNodes = async () => {
      const fetchedNodes: Node[] = await ky
        .get(`${apiUrl}/nodes`)
        .json();
      setNodesById(byId<Node>(fetchedNodes));
    };

    fetchNodes();
  }, [setNodesById]);

  return (
    <div className="with-sidebar">
      <nav className="sidebar">
        <div className="search">
          <form
            onSubmit={(e: React.SyntheticEvent) => {
              e.preventDefault();
              if (!!query.trim()) debouncedSearch(query.trim());
            }}
          >
            <input
              value={query}
              onChange={(e) => {
                const newQuery = e.currentTarget.value;
                setQuery(newQuery);

                // Use the newest search term value instead of the one in state
                // since setState is async and we may have an outdated value when
                // firing the search request
                if (!!newQuery.trim()) debouncedSearch(newQuery.trim());
              }}
              type="text"
              placeholder="Search"
            />
          </form>
        </div>

        {Object.values(nodesById).map((node) => (
          <NodeItem
            activePath={activeNodeIdPath.join("-")}
            path={[node.id]}
            node={node}
            onClick={(id: number, path: number[]) => {
              setShowResults(false);
              setActiveNodeIdPath(path);
              fetchNode(id);
            }}
            getConnections={(ids: number[]) => getNodes(nodesById, ids)}
            key={node.id}
          />
        ))}
      </nav>

      <main>
        {query.trim() === searchResults.query && showSearchResults && (
          <SearchResults data={searchResults} />
        )}

        {(!query || !showSearchResults) && activeNodeId && (
          <Details node={nodesById[activeNodeId]} />
        )}

        {!showSearchResults && !activeNodeId && (
          <p>
            <span role="img" aria-label="Point to sidebar">
              👈{" "}
            </span>
            select or search something to start your journey!
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
